const axios = require('axios');

exports.main = async (context = {}) => {
  const { code, state } = context.params;

  if (!code) {
    return {
      statusCode: 400,
      body: { error: 'Authorization code is missing' }
    };
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
      code: code
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens securely (in production, use a database)
    // For now, return success
    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'OAuth authentication successful'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: 'Token exchange failed',
        details: error.message
      }
    };
  }
};