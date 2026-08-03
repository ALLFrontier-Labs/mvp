import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Zap, Copy, Check, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck
} from 'lucide-react';
import { api, setStoredApiKey, getStoredApiKey } from '../lib/api';
import { DaemonLogo } from '../components/DaemonLogo';

export type AuthMode = 'signup' | 'login' | 'apikey' | 'forgotpw';

export interface LoginProps {
  initialMode?: AuthMode;
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validatePassword(v: string) {
  return v.length >= 8;
}

export const Login: React.FC<LoginProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode based on prop or current URL path
  const defaultMode: AuthMode = initialMode || (
    location.pathname === '/signup'
      ? 'signup'
      : location.pathname === '/login'
        ? 'login'
        : 'signup'
  );

  // ── Auto Redirection if already authenticated ──────────────────────────────
  useEffect(() => {
    if (getStoredApiKey()) {
      navigate('/overview', { replace: true });
    }
  }, [navigate]);

  const [mode, setMode]                 = useState<AuthMode>(defaultMode);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [apiKeyInput, setApiKeyInput]   = useState('');
  const [agreeTerms, setAgreeTerms]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);
  const [forgotSent, setForgotSent]     = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
    setForgotSent(false);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (mode === 'signup' || mode === 'login') {
      if (!email) errs.email = 'Email address is required.';
      else if (!validateEmail(email)) errs.email = 'Enter a valid email address.';

      if (!password) errs.password = 'Password is required.';
      else if (mode === 'signup' && !validatePassword(password))
        errs.password = 'Password must be at least 8 characters.';

      if (mode === 'signup' && !agreeTerms)
        errs.terms = 'You must agree to the Terms of Service and Privacy Policy to continue.';
    }

    if (mode === 'apikey') {
      if (!apiKeyInput.trim()) errs.apikey = 'Please paste your API key.';
      else if (!apiKeyInput.trim().startsWith('ld_'))
        errs.apikey = 'API keys start with "ld_". Check that you copied the full key.';
    }

    if (mode === 'forgotpw') {
      if (!email) errs.email = 'Email address is required.';
      else if (!validateEmail(email)) errs.email = 'Enter a valid email address.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'forgotpw') {
      setForgotSent(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.signup(email, password, firstName || undefined, lastName || undefined);
        const key = res.api_key || (res as any).apiKey;
        setStoredApiKey(key);
        setCreatedApiKey(key);
      } else if (mode === 'login') {
        const res = await api.login(email, password);
        const key = res.api_key || (res as any).apiKey;
        setStoredApiKey(key);
        navigate('/overview');
      } else if (mode === 'apikey') {
        const key = apiKeyInput.trim();
        setStoredApiKey(key);
        navigate('/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!createdApiKey) return;
    try {
      await navigator.clipboard.writeText(createdApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleGoogleSignIn = () => {
    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      '';
    if (!clientId) {
      alert('Google OAuth Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID in your environment variables.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  // ── Created Key Screen Modal ────────────────────────────────────────────────
  if (createdApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div 
          className="w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(204, 255, 0, 0.1)', color: '#ccff00' }}>
            <Zap className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Account Created!</h2>
            <p className="text-xs text-zinc-400">
              Save your LiteDaemon Master API Key now. You can use this key to authenticate tool calls or access the dashboard.
            </p>
          </div>

          <div className="p-4 rounded-2xl border font-mono text-xs text-left relative space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Your Master API Key</div>
            <div className="break-all font-semibold" style={{ color: '#ccff00' }}>{createdApiKey}</div>
            <button
              onClick={handleCopyKey}
              className="w-full mt-2 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy API Key'}</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/overview')}
            className="w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Determine button state and styles
  const isSubmitDisabled = loading || (mode === 'signup' && !agreeTerms);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2.5 mb-6 group focus:outline-none">
        <DaemonLogo size={36} showText={true} />
      </Link>

      {/* Main Auth Dialog Card */}
      <div 
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative transition-all"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {mode === 'signup' && 'Create your LiteDaemon Account'}
            {mode === 'login' && 'Sign in to LiteDaemon'}
            {mode === 'apikey' && 'Sign in with Master API Key'}
            {mode === 'forgotpw' && 'Reset your Password'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Access 30+ AI tool providers, client-encrypted key vaults, and unified failover gateways.
          </p>
        </div>

        {/* ── Prominent Google OAuth Button ──────────────────────────────────── */}
        {(mode === 'signup' || mode === 'login') && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 text-xs font-semibold transition-all cursor-pointer bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Clean Muted Dividing Separator */}
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                — or continue with email —
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Password Reset Sent Notice */}
        {forgotSent && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs space-y-1">
            <div className="font-bold">Check your inbox</div>
            <div>If an account exists for {email}, password reset instructions have been sent.</div>
          </div>
        )}

        {/* Email & Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Sign Up Mode: Side-by-side First/Last Name Inputs */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>First name</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-400 transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Last name</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-400 transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}

          {/* Email Input (signup, login, forgotpw) */}
          {(mode === 'signup' || mode === 'login' || mode === 'forgotpw') && (
            <div className="space-y-1">
              <label className="font-medium text-zinc-500 dark:text-zinc-400">Email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-400 transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {fieldErrors.email && <div className="text-rose-400 text-[10px]">{fieldErrors.email}</div>}
            </div>
          )}

          {/* Password Input (signup, login) */}
          {(mode === 'signup' || mode === 'login') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-zinc-500 dark:text-zinc-400">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgotpw')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-200 underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password (min 8 chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-400 pr-10 transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {fieldErrors.password && <div className="text-rose-400 text-[10px]">{fieldErrors.password}</div>}
            </div>
          )}

          {/* API Key Input Mode */}
          {mode === 'apikey' && (
            <div className="space-y-1">
              <label className="font-medium text-zinc-500 dark:text-zinc-400">Master API Key</label>
              <input
                type="text"
                placeholder="ld_live_..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-lime-400 dark:focus:ring-lime-400 font-mono transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {fieldErrors.apikey && <div className="text-rose-400 text-[10px]">{fieldErrors.apikey}</div>}
            </div>
          )}

          {/* Enforced Terms Checkbox (Sign Up Mode) */}
          {mode === 'signup' && (
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-400 dark:border-zinc-700 text-lime-500 focus:ring-lime-400 shrink-0 cursor-pointer"
                />
                <span>
                  I agree to the <Link to="/terms" className="text-lime-600 dark:text-lime-400 hover:underline font-semibold">Terms of Service</Link> and <Link to="/privacy" className="text-lime-600 dark:text-lime-400 hover:underline font-semibold">Privacy Policy</Link>.
                </span>
              </label>
              {fieldErrors.terms && <div className="text-rose-400 text-[10px]">{fieldErrors.terms}</div>}
            </div>
          )}

          {/* Primary Submit Action Button (Disabled when Terms not checked) */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all mt-2 ${
              isSubmitDisabled
                ? 'opacity-50 cursor-not-allowed bg-zinc-300 dark:bg-zinc-800 text-zinc-500'
                : 'bg-lime-400 hover:bg-lime-300 text-zinc-950 font-semibold cursor-pointer shadow-lg shadow-lime-400/20'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {mode === 'signup' && 'Continue'}
              {mode === 'login' && 'Sign In'}
              {mode === 'apikey' && 'Sign In with Key'}
              {mode === 'forgotpw' && 'Send Instructions'}
            </span>
          </button>

        </form>

        {/* ── Bottom Mode Switch Links ────────────────────────────────────────── */}
        <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
          {mode === 'signup' && (
            <div>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="text-zinc-900 dark:text-zinc-100 font-bold underline hover:text-lime-500 cursor-pointer">
                Sign in
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div>
              Don't have an account?{' '}
              <button onClick={() => switchMode('signup')} className="text-lime-600 dark:text-lime-400 font-bold underline hover:opacity-80 cursor-pointer">
                Sign up
              </button>
            </div>
          )}

          {(mode === 'signup' || mode === 'login') && (
            <div>
              <button onClick={() => switchMode('apikey')} className="text-zinc-500 dark:text-zinc-400 text-[11px] underline hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                Have a saved API key? Sign in with API key
              </button>
            </div>
          )}

          {(mode === 'apikey' || mode === 'forgotpw') && (
            <div>
              <button onClick={() => switchMode('login')} className="text-zinc-500 dark:text-zinc-400 text-[11px] underline hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                Back to Sign In
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
