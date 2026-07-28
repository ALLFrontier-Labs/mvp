import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Key, Copy, Check, AlertTriangle, ArrowRight, ShieldCheck, LogIn,
  Eye, EyeOff, Lock, Mail, Github, Globe, Loader2, Info
} from 'lucide-react';
import { api, setStoredApiKey } from '../lib/api';

type AuthMode = 'signup' | 'login' | 'apikey';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
  };

  // ── Social Login Handler (GitHub, Google, MetaMask) ──────────────────────
  const handleSocialAuth = async (provider: 'github' | 'google' | 'metamask') => {
    setSocialLoading(provider);
    setError(null);
    try {
      // Perform quick developer entry via social auth endpoint
      const mockEmail = `dev_${provider}_${Math.random().toString(36).substring(2, 7)}@litedaemon.io`;
      const res = await api.socialAuth(provider, mockEmail, provider === 'github' ? 'GitHub Developer' : provider);
      setStoredApiKey(res.api_key);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `${provider} authentication failed`);
    } finally {
      setSocialLoading(null);
    }
  };

  // ── Form Submit (Signup or Login) ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!agreeTerms && mode === 'signup') {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.signup(email, password, firstName, lastName);
        setStoredApiKey(res.api_key);
        setCreatedApiKey(res.api_key);
      } else if (mode === 'login') {
        const res = await api.login(email, password);
        setStoredApiKey(res.api_key);
        navigate('/dashboard');
      } else if (mode === 'apikey') {
        const trimmed = apiKeyInput.trim();
        if (!trimmed) {
          setError('Please enter your API key.');
          setLoading(false);
          return;
        }
        setStoredApiKey(trimmed);
        await api.getUsage(); // validate key
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (mode === 'apikey') {
        localStorage.removeItem('litedaemon_api_key');
        setError('Invalid API key. Please check and try again.');
      } else if (err.message?.toLowerCase().includes('already_registered') || err.message?.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please enter your password to Sign In.');
        setMode('login');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {createdApiKey ? 'API Key Created' : mode === 'signup' ? 'Sign Up' : mode === 'login' ? 'Sign In' : 'API Key Access'}
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            One Unified Wallet · 10 AI Providers · Zero Platform Markup
          </p>
        </div>

        {/* ── API Key Banner Card (After successful sign up) ──────────────────── */}
        {createdApiKey ? (
          <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-6 space-y-5 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Master API Key Generated!</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Your API Key (Save immediately)
              </label>
              <div className="flex items-center space-x-2 bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
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

            <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3.5 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5 text-rose-200">Save this key now!</strong>
                You can also log back in anytime using your Email and Password.
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Go to Developer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (

          /* ── OpenRouter-Style Auth Card ────────────────────────────────────── */
          <div className="rounded-2xl glass-card border border-slate-800/90 p-8 shadow-2xl space-y-6">

            {/* Top Social Auth Buttons Row (OpenRouter Style: GitHub | Google | MetaMask) */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                
                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('github')}
                  disabled={!!socialLoading}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white transition-all group"
                  title="Sign in with GitHub"
                >
                  {socialLoading === 'github' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  ) : (
                    <Github className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                  )}
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={!!socialLoading}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white transition-all group"
                  title="Sign in with Google"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-.8-1-1.8-1-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 22.3z" />
                    </svg>
                  )}
                </button>

                {/* Web3 / MetaMask */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('metamask')}
                  disabled={!!socialLoading}
                  className="flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white transition-all group"
                  title="Sign in with Web3 / Wallet"
                >
                  {socialLoading === 'metamask' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  ) : (
                    <span className="text-lg leading-none" role="img" aria-label="MetaMask">🦊</span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-[#0a0d14] text-[11px] font-mono text-slate-500 uppercase">
                  or
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* API Key Mode */}
              {mode === 'apikey' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                    Your API Key
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="ld_live_..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono text-xs transition-colors"
                  />
                  <p className="text-[11px] text-slate-500">
                    Paste your raw API key if you stored it previously.
                  </p>
                </div>
              ) : (
                <>
                  {/* Optional Names row for Signup */}
                  {mode === 'signup' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs text-slate-300 font-medium">First name</label>
                          <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-xs font-mono transition-colors"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs text-slate-300 font-medium">Last name</label>
                          <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-xs font-mono transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email address */}
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-xs font-mono transition-colors"
                    />
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-xs font-mono transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  {mode === 'signup' && (
                    <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 bg-[#0a0d14] text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400 leading-tight">
                        I agree to the{' '}
                        <span className="text-emerald-400 hover:underline cursor-pointer">Terms of Service</span>,{' '}
                        <span className="text-emerald-400 hover:underline cursor-pointer">Privacy Policy</span>, and{' '}
                        <span className="text-emerald-400 hover:underline cursor-pointer">Model Terms</span>.
                      </span>
                    </label>
                  )}
                </>
              )}

              {/* Primary Neon Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {mode === 'signup' ? 'Continue' : mode === 'login' ? 'Sign In' : 'Sign In with Key'}
                  </span>
                )}
              </button>
            </form>

            {/* Footer Navigation Links */}
            <div className="pt-4 border-t border-slate-800/80 text-center space-y-2 text-xs text-slate-400 font-mono">
              {mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}

              <p className="text-[11px] text-slate-500">
                {mode === 'apikey' ? (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-slate-400 hover:text-slate-200 underline"
                  >
                    ← Back to Email / Password Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchMode('apikey')}
                    className="text-slate-500 hover:text-slate-300 underline"
                  >
                    Or sign in using an existing API key
                  </button>
                )}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
