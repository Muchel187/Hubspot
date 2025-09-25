import React, { useState, useEffect } from 'react';
import { KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * HubSpot OAuth Authentication Component
 * Handles the OAuth flow in the dashboard
 */
const HubSpotAuth = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portals, setPortals] = useState([]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      const portalId = params.get('portal');
      showNotification(`Successfully connected to HubSpot Portal ${portalId}!`, 'success');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      showNotification(`Authentication failed: ${params.get('error')}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();

      setAuthStatus(data.authenticated);
      setPortals(data.portals || []);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const connectToHubSpot = () => {
    // Redirect to OAuth flow
    window.location.href = 'http://localhost:3000/auth/connect';
  };

  const disconnectHubSpot = async (portalId) => {
    if (!confirm('Are you sure you want to disconnect from HubSpot?')) return;

    try {
      const response = await fetch('http://localhost:3000/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId }),
        credentials: 'include'
      });

      if (response.ok) {
        showNotification('Disconnected from HubSpot', 'success');
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      showNotification('Failed to disconnect', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification (in production use a proper notification system)
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const refreshToken = async (portalId) => {
    try {
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId }),
        credentials: 'include'
      });

      if (response.ok) {
        showNotification('Token refreshed successfully', 'success');
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      showNotification('Failed to refresh token', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OAuth Connection Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <KeyIcon className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">HubSpot OAuth Connection</h2>
          </div>
          {authStatus ? (
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-400" />
          )}
        </div>

        {!authStatus ? (
          <div className="space-y-4">
            <p className="text-gray-400">
              Connect your HubSpot account using OAuth 2.0 for secure access to your CRM data.
            </p>
            <button
              onClick={connectToHubSpot}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <KeyIcon className="h-5 w-5" />
              Connect to HubSpot
            </button>
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">What permissions will be granted:</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Read and write contacts</li>
                <li>• Read and write companies</li>
                <li>• Read and write deals</li>
                <li>• Manage pipelines</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-400 font-medium">✅ Connected to HubSpot</p>

            {/* Connected Portals */}
            {portals.map(portal => (
              <div key={portal.portalId} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{portal.accountName}</p>
                    <p className="text-gray-400 text-sm">Portal ID: {portal.portalId}</p>
                    <p className="text-gray-500 text-xs">
                      Token expires: {new Date(portal.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => refreshToken(portal.portalId)}
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm transition-colors"
                    >
                      Refresh Token
                    </button>
                    <button
                      onClick={() => disconnectHubSpot(portal.portalId)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OAuth Setup Instructions */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">OAuth Setup Instructions</h3>
        <div className="space-y-3 text-gray-400">
          <div>
            <p className="font-medium text-white">For HubSpot App Developers:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Create a public app in HubSpot</li>
              <li>Configure OAuth redirect URL: <code className="bg-slate-700 px-2 py-1 rounded">http://localhost:3000/auth/callback</code></li>
              <li>Add required scopes for CRM access</li>
              <li>Copy Client ID and Client Secret to .env file</li>
            </ol>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 mt-4">
            <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Environment Variables Required:</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
{`HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/auth/callback`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotAuth;