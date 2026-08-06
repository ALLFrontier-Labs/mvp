import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, setStoredApiKey } from '../lib/api';
import { getRedirectUri } from '../lib/constants';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const hasExchanged = useRef(false);

  useEffect(() => {
    if (hasExchanged.current) return;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code) {
      setError('No authorization code found in the URL.');
      return;
    }

    // STATE HYGIENE: Immediately strip the single-use code from the URL so that 
    // page refreshes, back-button navigations, or bookmarks do NOT attempt to 
    // replay the stale code (which triggers a 400 invalid_grant upstream).
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchangeCode = async () => {
      hasExchanged.current = true;
      try {
        const redirectUri = getRedirectUri();
        const res = await api.googleExchange(code, redirectUri);
        
        const key = res.api_key || (res as any).apiKey;
        if (key) {
          setStoredApiKey(key);
          navigate('/overview', { replace: true });
        } else {
          setError('Authentication failed. No API key returned.');
        }
      } catch (err: any) {
        console.error('Exchange error:', err);
        setError(err.message || 'Failed to authenticate with Google.');
      }
    };

    exchangeCode();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-rose-500/20 bg-white dark:bg-zinc-900 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Authentication Failed</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="mt-4 px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-lime-500" />
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Authenticating...</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Please wait while we securely sign you in.</p>
      </div>
    </div>
  );
};
