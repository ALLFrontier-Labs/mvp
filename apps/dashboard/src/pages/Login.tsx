import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Key, Copy, Check, AlertTriangle, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import { api, setStoredApiKey } from '../lib/api';

type Mode = 'signup' | 'login';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setApiKeyInput('');
  };

  // ── Signup: create a new account ──────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.signup(email);
      setCreatedApiKey(res.api_key);
      setStoredApiKey(res.api_key);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already_registered') || err.message?.toLowerCase().includes('already registered')) {
        // Auto-switch to login mode with a helpful message
        setError('This email is already registered. Switch to "Sign In" and paste your API key below.');
        switchMode('login');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Login: validate an existing API key by hitting /usage ─────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) return;

    setLoading(true);
    setError(null);

    try {
      // Temporarily store the key so apiRequest() picks it up
      setStoredApiKey(trimmedKey);
      await api.getUsage(); // will throw if key is invalid (401)
      // Key is valid — navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      // Remove the bad key
      localStorage.removeItem('litedaemon_api_key');
      setError('Invalid API key. Please double-check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (createdApiKey) {
      navigator.clipboard.writeText(createdApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Developer Access</h2>
          <p className="mt-2 text-sm text-slate-400">
            One API Key. Prepaid Wallet. Zero Margin on 10 AI Tools.
          </p>
        </div>

        {/* Tab Toggle */}
        {!createdApiKey && (
          <div className="flex rounded-xl bg-slate-900/60 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Account
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* API Key Banner (after successful signup) */}
        {createdApiKey ? (
          <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-6 space-y-4 shadow-xl shadow-emerald-500/5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-5 h-5" />
              <span>API Key Generated Successfully!</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Your Master API Key</label>
              <div className="flex items-center space-x-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                <span className="flex-1">{createdApiKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex-shrink-0"
                  title="Copy API Key"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Red Copy Warning */}
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5 text-rose-200">Save this key immediately!</strong>
                It will not be shown again. LiteDaemon stores only the SHA-256 hash of this key.
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Go to Developer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : mode === 'signup' ? (
          /* ── Signup Form ─────────────────────────────────────────────────── */
          <form onSubmit={handleSignup} className="rounded-2xl bg-[#121620]/80 border border-slate-800 p-8 shadow-2xl space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-email" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Work / Developer Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@company.com"
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating API Key...</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Get API Key & Enter Dashboard</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500">
                LiteDaemon is zero-margin & pre-revenue. Free tier includes starter credits.
              </p>
            </div>
          </form>
        ) : (
          /* ── Login Form (existing API key) ──────────────────────────────── */
          <form onSubmit={handleLogin} className="rounded-2xl bg-[#121620]/80 border border-slate-800 p-8 shadow-2xl space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="api-key-input" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Your API Key
              </label>
              <input
                id="api-key-input"
                type="text"
                required
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="ld_live_..."
                className="w-full px-4 py-3 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                Paste the API key you received when you first signed up.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying key...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500">
                Don't have a key yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Create a free account
                </button>
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
