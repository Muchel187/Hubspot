import React, { useState, useEffect } from 'react';
import { KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const HubSpotOAuth = ({ onAuthSuccess }) => {
  const [authStatus, setAuthStatus] = useState('disconnected');
  const [portalInfo, setPortalInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // OAuth Configuration from HubSpot App
  const OAUTH_CONFIG = {
    clientId: import.meta.env.VITE_HUBSPOT_CLIENT_ID || '1f511560-e8a1-4e5f-a192-5e960797f9ea', // Your App ID from screenshot
    redirectUri: import.meta.env.VITE_HUBSPOT_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    scopes: 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write'
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/status');
      const data = await response.json();

      if (data.authenticated && data.portals.length > 0) {
        setAuthStatus('connected');
        setPortalInfo(data.portals[0]);
        if (onAuthSuccess) onAuthSuccess(data.portals[0]);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleConnect = () => {
    setLoading(true);

    // Build OAuth URL
    const authUrl = `https://app.hubspot.com/oauth/authorize` +
      `?client_id=${OAUTH_CONFIG.clientId}` +
      `&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.redirectUri)}` +
      `&scope=${encodeURIComponent(OAUTH_CONFIG.scopes)}`;

    // Open in new window or redirect
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const authWindow = window.open(
      authUrl,
      'HubSpot OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if auth was successful
    const checkInterval = setInterval(() => {
      if (authWindow && authWindow.closed) {
        clearInterval(checkInterval);
        setLoading(false);
        checkAuthStatus();
      }
    }, 1000);
  };

  const handleDisconnect = async () => {
    if (!portalInfo) return;

    try {
      await fetch('http://localhost:3000/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId: portalInfo.portalId })
      });

      setAuthStatus('disconnected');
      setPortalInfo(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <KeyIcon className="h-6 w-6 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">HubSpot OAuth Integration</h2>
      </div>

      <div className="space-y-4">
        {authStatus === 'disconnected' ? (
          <div>
            <p className="text-gray-400 mb-4">
              Verbinden Sie Ihr HubSpot-Konto mit OAuth 2.0 für sichere API-Zugriffe.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Verbinde...
                </>
              ) : (
                <>
                  <KeyIcon className="h-5 w-5" />
                  Mit HubSpot verbinden
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Verbunden mit HubSpot</p>
                {portalInfo && (
                  <p className="text-gray-400 text-sm">
                    Portal ID: {portalInfo.portalId} | {portalInfo.accountName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Verbindung trennen
              </button>
              <button
                onClick={checkAuthStatus}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Status aktualisieren
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">OAuth Details</h3>
          <div className="space-y-1 text-xs">
            <p className="text-gray-500">Client ID: {OAUTH_CONFIG.clientId}</p>
            <p className="text-gray-500">Redirect URI: {OAUTH_CONFIG.redirectUri}</p>
            <p className="text-gray-500">Status: {authStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotOAuth;