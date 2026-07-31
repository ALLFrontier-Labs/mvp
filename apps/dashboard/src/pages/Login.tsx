import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, Key, Copy, Check, Eye, EyeOff, Loader2, Mail, Lock,
  ArrowRight, ShieldCheck, Github, Globe, Sparkles
} from 'lucide-react';
import { api, setStoredApiKey, getStoredApiKey } from '../lib/api';

type AuthMode = 'signup' | 'login' | 'apikey' | 'forgotpw';

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePassword(v: string) {
  return v.length >= 8;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();

  // ── Auto Redirection if already authenticated ──────────────────────────────
  useEffect(() => {
    if (getStoredApiKey()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [mode, setMode]               = useState<AuthMode>('signup');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [agreeTerms, setAgreeTerms]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [forgotSent, setForgotSent]   = useState(false);

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
        errs.terms = 'You must agree to the Terms of Service to continue.';
    }

    if (mode === 'apikey') {
      if (!apiKeyInput.trim()) errs.apikey = 'Please paste your API key.';
      else if (!apiKeyInput.trim().startsWith('ld_'))
        errs.apikey = 'API keys start with "ld_". Check you copied the full key.';
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
        navigate('/dashboard');
      } else if (mode === 'apikey') {
        const key = apiKeyInput.trim();
        setStoredApiKey(key);
        navigate('/dashboard');
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

  const handleSocialMock = (provider: string) => {
    // Quick demo login for social OAuth
    const mockKey = `ld_live_demo_${provider}_${Math.random().toString(36).substring(2, 10)}`;
    setStoredApiKey(mockKey);
    navigate('/dashboard');
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
            onClick={() => navigate('/dashboard')}
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

  // ── Main Auth Card Modal Design (OpenRouter Parity) ───────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-6 group">
        <svg className="w-6 h-6 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ccff00' }}>
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
        <span className="font-bold tracking-tight text-base" style={{ color: 'var(--text-primary)' }}>LiteDaemon</span>
      </Link>

      {/* Main Dialog Card */}
      <div 
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative transition-all"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {mode === 'signup' && 'Sign Up'}
            {mode === 'login' && 'Sign In'}
            {mode === 'apikey' && 'Sign In with API Key'}
            {mode === 'forgotpw' && 'Reset Password'}
          </h1>
        </div>

        {/* ── Social OAuth Buttons Row (OpenRouter Style) ──────────────── */}
        {(mode === 'signup' || mode === 'login') && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialMock('github')}
                className="py-2.5 rounded-xl border flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                title="Continue with GitHub"
              >
                <Github className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              </button>

              <button
                type="button"
                onClick={() => handleSocialMock('google')}
                className="py-2.5 rounded-xl border flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                title="Continue with Google"
              >
                <Globe className="w-4 h-4 text-rose-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialMock('web3')}
                className="py-2.5 rounded-xl border flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                title="Continue with Web3 / Wallet"
              >
                <Key className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
              <span className="text-[11px] font-mono text-zinc-500">or</span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Sign Up Mode: Side-by-side First/Last Name Inputs */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-zinc-400 flex items-center justify-between">
                  <span>First name</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-400 flex items-center justify-between">
                  <span>Last name</span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}

          {/* Email Input (signup, login, forgotpw) */}
          {(mode === 'signup' || mode === 'login' || mode === 'forgotpw') && (
            <div className="space-y-1">
              <label className="font-medium text-zinc-400">Email address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {fieldErrors.email && <div className="text-rose-400 text-[10px]">{fieldErrors.email}</div>}
            </div>
          )}

          {/* Password Input (signup, login) */}
          {(mode === 'signup' || mode === 'login') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-zinc-400">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgotpw')}
                    className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 pr-10"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
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
              <label className="font-medium text-zinc-400">Master API Key</label>
              <input
                type="text"
                placeholder="ld_live_..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {fieldErrors.apikey && <div className="text-rose-400 text-[10px]">{fieldErrors.apikey}</div>}
            </div>
          )}

          {/* Sign Up Terms Checkbox */}
          {mode === 'signup' && (
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] leading-snug text-zinc-400">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border text-emerald-500 focus:ring-emerald-500 shrink-0"
                />
                <span>
                  I agree to the <Link to="/terms" className="text-[#ccff00] hover:underline font-semibold">Terms of Service</Link>, <Link to="/privacy" className="text-[#ccff00] hover:underline font-semibold">Privacy Policy</Link>, and Acceptable Use Policy.
                </span>
              </label>
              {fieldErrors.terms && <div className="text-rose-400 text-[10px]">{fieldErrors.terms}</div>}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90 mt-2"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
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

        {/* ── Bottom Switch Links ────────────────────────────────────────── */}
        <div className="pt-2 text-center text-xs text-zinc-400 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
          {mode === 'signup' && (
            <div>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="text-white font-semibold underline hover:text-[#ccff00] cursor-pointer">
                Sign in
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div>
              Don't have an account?{' '}
              <button onClick={() => switchMode('signup')} className="text-[#ccff00] font-semibold underline hover:opacity-80 cursor-pointer">
                Sign up
              </button>
            </div>
          )}

          {(mode === 'signup' || mode === 'login') && (
            <div>
              <button onClick={() => switchMode('apikey')} className="text-zinc-400 text-[11px] underline hover:text-white cursor-pointer">
                Have a saved API key? Sign in with API key
              </button>
            </div>
          )}

          {(mode === 'apikey' || mode === 'forgotpw') && (
            <div>
              <button onClick={() => switchMode('login')} className="text-zinc-400 text-[11px] underline hover:text-white cursor-pointer">
                Back to Sign In
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
