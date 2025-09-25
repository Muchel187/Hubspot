/**
 * HubSpot OAuth 2.0 Authentication
 * Handles the OAuth flow for HubSpot integration
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// OAuth Configuration
const OAUTH_CONFIG = {
  clientId: process.env.HUBSPOT_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.HUBSPOT_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  redirectUri: process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  scopes: [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.companies.read',
    'crm.objects.companies.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
    'oauth'
  ]
};

// Store tokens (in production use a database)
let tokenStore = {};

/**
 * Step 1: Initiate OAuth flow
 * Redirect user to HubSpot authorization page
 */
router.get('/connect', (req, res) => {
  const authUrl = `https://app.hubspot.com/oauth/authorize` +
    `?client_id=${OAUTH_CONFIG.clientId}` +
    `&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.redirectUri)}` +
    `&scope=${OAUTH_CONFIG.scopes.join('%20')}`;

  console.log('[OAuth] Redirecting to HubSpot authorization:', authUrl);
  res.redirect(authUrl);
});

/**
 * Step 2: Handle OAuth callback
 * Exchange authorization code for access token
 */
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('[OAuth] Authorization denied:', error);
    return res.redirect('/dashboard?error=auth_denied');
  }

  if (!code) {
    console.error('[OAuth] No authorization code received');
    return res.redirect('/dashboard?error=no_code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      code: code
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get account info
    const accountResponse = await axios.get('https://api.hubapi.com/account-info/v3/details', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    // Store tokens (in production, save to database)
    const portalId = accountResponse.data.portalId;
    tokenStore[portalId] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000),
      portalId: portalId,
      accountName: accountResponse.data.companyName
    };

    console.log('[OAuth] Successfully authenticated for portal:', portalId);

    // Redirect to dashboard with success
    res.redirect(`/dashboard?auth=success&portal=${portalId}`);

  } catch (error) {
    console.error('[OAuth] Token exchange failed:', error.response?.data || error.message);
    res.redirect('/dashboard?error=token_exchange_failed');
  }
});

/**
 * Step 3: Refresh access token when expired
 */
router.post('/refresh', async (req, res) => {
  const { portalId } = req.body;

  if (!tokenStore[portalId]?.refreshToken) {
    return res.status(401).json({ error: 'No refresh token available' });
  }

  try {
    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
      grant_type: 'refresh_token',
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      refresh_token: tokenStore[portalId].refreshToken
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Update stored tokens
    tokenStore[portalId] = {
      ...tokenStore[portalId],
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };

    res.json({
      success: true,
      accessToken: access_token,
      expiresAt: tokenStore[portalId].expiresAt
    });

  } catch (error) {
    console.error('[OAuth] Token refresh failed:', error.response?.data || error.message);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

/**
 * Get current access token for a portal
 */
router.get('/token/:portalId', async (req, res) => {
  const { portalId } = req.params;
  const tokenData = tokenStore[portalId];

  if (!tokenData) {
    return res.status(404).json({ error: 'No token found for this portal' });
  }

  // Check if token is expired
  if (Date.now() >= tokenData.expiresAt) {
    // Trigger refresh
    try {
      await refreshToken(portalId);
    } catch (error) {
      return res.status(401).json({ error: 'Token expired and refresh failed' });
    }
  }

  res.json({
    accessToken: tokenStore[portalId].accessToken,
    expiresAt: tokenStore[portalId].expiresAt,
    accountName: tokenStore[portalId].accountName
  });
});

/**
 * Disconnect/logout
 */
router.post('/disconnect', (req, res) => {
  const { portalId } = req.body;

  if (tokenStore[portalId]) {
    delete tokenStore[portalId];
    console.log('[OAuth] Disconnected portal:', portalId);
  }

  res.json({ success: true });
});

/**
 * Check authentication status
 */
router.get('/status', (req, res) => {
  const authenticated = Object.keys(tokenStore).length > 0;
  const portals = Object.values(tokenStore).map(t => ({
    portalId: t.portalId,
    accountName: t.accountName,
    expiresAt: t.expiresAt
  }));

  res.json({
    authenticated,
    portals
  });
});

// Helper function to refresh token
async function refreshToken(portalId) {
  if (!tokenStore[portalId]?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
    grant_type: 'refresh_token',
    client_id: OAUTH_CONFIG.clientId,
    client_secret: OAUTH_CONFIG.clientSecret,
    refresh_token: tokenStore[portalId].refreshToken
  });

  const { access_token, refresh_token, expires_in } = tokenResponse.data;

  tokenStore[portalId] = {
    ...tokenStore[portalId],
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: Date.now() + (expires_in * 1000)
  };

  return access_token;
}

// Export the token store for use in other modules
router.getTokenStore = () => tokenStore;

module.exports = router;