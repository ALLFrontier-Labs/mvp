import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Key, Copy, Check, AlertTriangle, ArrowRight,
  ShieldCheck, Eye, EyeOff, Loader2, Mail, Lock,
  ArrowLeft, HelpCircle,
} from 'lucide-react';
import { api, setStoredApiKey } from '../lib/api';

type AuthMode = 'signup' | 'login' | 'apikey' | 'forgotpw';

// ── Helpers ──────────────────────────────────────────────────────────────────
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePassword(v: string) {
  return v.length >= 8;
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-slate-800 text-white ' +
  'placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ' +
  'focus:border-emerald-500/50 text-sm transition-all font-mono';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode]               = useState<AuthMode>('signup');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [agreeTerms, setAgreeTerms]   = useState(false);        // ← fixed: default false
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [forgotSent, setForgotSent]   = useState(false);

  // ── Mode switch ─────────────────────────────────────────────────────────────
  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setFieldErrors({});
    setForgotSent(false);
  };

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (mode === 'signup' || mode === 'login') {
      if (!email)               errs.email = 'Email address is required.';
      else if (!validateEmail(email)) errs.email = 'Enter a valid email address.';

      if (!password)            errs.password = 'Password is required.';
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
      if (!email)               errs.email = 'Email address is required.';
      else if (!validateEmail(email)) errs.email = 'Enter a valid email address.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Forgot password — no real API yet, show support message
    if (mode === 'forgotpw') {
      setForgotSent(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.signup(email, password, firstName || undefined, lastName || undefined);
        setStoredApiKey(res.api_key);
        setCreatedApiKey(res.api_key);

      } else if (mode === 'login') {
        const res = await api.login(email, password);
        setStoredApiKey(res.api_key);
        navigate('/dashboard');

      } else if (mode === 'apikey') {
        const trimmed = apiKeyInput.trim();
        setStoredApiKey(trimmed);
        try {
          await api.getUsage();
          navigate('/dashboard');
        } catch {
          localStorage.removeItem('litedaemon_api_key');
          setFieldErrors({ apikey: 'API key is invalid or has been revoked. Please check and try again.' });
        }
      }
    } catch (err: any) {
      const msg: string = err.message ?? '';

      if (mode === 'signup') {
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
          setError(null);
          setFieldErrors({ email: 'An account with this email already exists.' });
          // Helpfully switch to login so user can sign in
          setTimeout(() => switchMode('login'), 800);
        } else {
          setError(msg || 'Sign-up failed. Please try again.');
        }
      } else if (mode === 'login') {
        if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('not found')) {
          setFieldErrors({ password: 'Incorrect email or password. Please try again.' });
        } else {
          setError(msg || 'Sign-in failed. Please try again.');
        }
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!createdApiKey) return;
    navigator.clipboard.writeText(createdApiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── After Signup: Show API key save card ─────────────────────────────────────
  if (createdApiKey) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Account Created!</h1>
            <p className="text-slate-400 text-xs font-mono">Save your API key before continuing</p>
          </div>

          <div className="rounded-2xl bg-[#0d1117] border border-emerald-500/40 p-6 space-y-5 shadow-2xl shadow-emerald-500/10">

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Your Master API Key
              </label>
              <div className="flex items-center gap-2 bg-[#080b10] p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                <span className="flex-1">{createdApiKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex-shrink-0"
                  title="Copy API Key"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-[11px] text-emerald-500 font-mono text-center animate-pulse">
                  ✓ Copied to clipboard
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="rounded-xl bg-amber-950/40 border border-amber-500/30 p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300/90">
                <strong className="block mb-0.5 text-amber-200">Store this key securely.</strong>
                You can also sign back in anytime using your email and password — no key needed.
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Open Developer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot password message ───────────────────────────────────────────────────
  if (mode === 'forgotpw' && forgotSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
              <Mail className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Check your inbox</h1>
          </div>
          <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-4 text-center text-sm text-slate-300">
            <p>
              If an account exists for <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-slate-500">
              Didn't get an email? Contact{' '}
              <a href="mailto:support@litedaemon.io" className="text-emerald-400 hover:underline">
                support@litedaemon.io
              </a>
            </p>
            <button
              onClick={() => switchMode('login')}
              className="flex items-center justify-center gap-2 mx-auto text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main auth page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {mode === 'apikey'   ? 'API Key Access' :
             mode === 'forgotpw' ? 'Reset Password'  :
             mode === 'signup'   ? 'Create Account'  : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            One Unified Wallet · 10 AI Providers · Zero Platform Markup
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-8 shadow-2xl space-y-5">

          {/* ── Tab switcher (Sign Up / Sign In) — not shown in apikey / forgotpw modes */}
          {mode !== 'apikey' && mode !== 'forgotpw' && (
            <div className="flex rounded-xl bg-slate-900/60 border border-slate-800/60 p-1">
              {(['signup', 'login'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m === 'signup' ? 'Sign Up' : 'Sign In'}
                </button>
              ))}
            </div>
          )}

          {/* ── Back link for sub-modes */}
          {(mode === 'apikey' || mode === 'forgotpw') && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          )}

          {/* Global error banner */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* ── API Key mode ─────────────────────────────────────────── */}
            {mode === 'apikey' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Your API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    id="apikey-input"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setFieldErrors({});
                    }}
                    placeholder="ld_live_..."
                    className={`${inputCls} pl-10 ${fieldErrors.apikey ? 'border-rose-500/50 focus:ring-rose-500/20' : ''}`}
                  />
                </div>
                {fieldErrors.apikey && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />{fieldErrors.apikey}
                  </p>
                )}
                <p className="text-[11px] text-slate-600 pt-0.5">
                  Paste the API key you saved when you first signed up.
                </p>
              </div>
            )}

            {/* ── Forgot password mode ──────────────────────────────────── */}
            {mode === 'forgotpw' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    id="forgotpw-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
                    placeholder="you@example.com"
                    className={`${inputCls} pl-10 ${fieldErrors.email ? 'border-rose-500/50 focus:ring-rose-500/20' : ''}`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />{fieldErrors.email}
                  </p>
                )}
              </div>
            )}

            {/* ── Signup / Login fields ─────────────────────────────────── */}
            {(mode === 'signup' || mode === 'login') && (
              <>
                {/* Name row — signup only */}
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        First name <span className="text-slate-600">(optional)</span>
                      </label>
                      <input
                        id="signup-first"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Last name <span className="text-slate-600">(optional)</span>
                      </label>
                      <input
                        id="signup-last"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last"
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input
                      id={mode === 'signup' ? 'signup-email' : 'login-email'}
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                      placeholder="you@example.com"
                      className={`${inputCls} pl-10 ${fieldErrors.email ? 'border-rose-500/50 focus:ring-rose-500/20' : ''}`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />{fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgotpw')}
                        className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                    <input
                      id={mode === 'signup' ? 'signup-password' : 'login-password'}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                      placeholder={mode === 'signup' ? 'Create a password (min. 8 chars)' : 'Enter your password'}
                      className={`${inputCls} pl-10 pr-11 ${fieldErrors.password ? 'border-rose-500/50 focus:ring-rose-500/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />{fieldErrors.password}
                    </p>
                  )}
                  {/* Password strength hint on signup */}
                  {mode === 'signup' && password && !fieldErrors.password && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 w-10 rounded-full transition-colors ${
                              password.length >= 12 ? 'bg-emerald-500' :
                              password.length >= 8  ? (i <= 2 ? 'bg-amber-500' : 'bg-slate-700') :
                              (i === 1 ? 'bg-rose-500' : 'bg-slate-700')
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Weak'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Terms checkbox — signup only */}
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          id="agree-terms"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            setFieldErrors((p) => ({ ...p, terms: '' }));
                          }}
                          className="sr-only peer"
                        />
                        {/* Custom checkbox */}
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          agreeTerms
                            ? 'bg-emerald-500 border-emerald-500'
                            : fieldErrors.terms
                              ? 'border-rose-500 bg-transparent'
                              : 'border-slate-600 bg-transparent group-hover:border-slate-400'
                        }`}>
                          {agreeTerms && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 leading-snug">
                        I agree to the{' '}
                        <a href="#" className="text-emerald-400 hover:underline" onClick={(e) => e.stopPropagation()}>Terms of Service</a>,{' '}
                        <a href="#" className="text-emerald-400 hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>, and{' '}
                        <a href="#" className="text-emerald-400 hover:underline" onClick={(e) => e.stopPropagation()}>Acceptable Use Policy</a>.
                      </span>
                    </label>
                    {fieldErrors.terms && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5 pl-7">
                        <AlertTriangle className="w-3 h-3" />{fieldErrors.terms}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Primary action button ─────────────────────────────────── */}
            <button
              id={`auth-submit-${mode}`}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <span>
                  {mode === 'signup'   ? 'Create Account' :
                   mode === 'login'    ? 'Sign In'         :
                   mode === 'forgotpw' ? 'Send Reset Link' :
                   'Sign In with Key'}
                </span>
              )}
            </button>
          </form>

          {/* ── Footer links ──────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-slate-800/60 space-y-3 text-center">
            {/* API Key access link */}
            {mode !== 'apikey' && mode !== 'forgotpw' && (
              <p className="text-[11px] text-slate-600">
                Have a saved API key?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('apikey')}
                  className="text-slate-400 hover:text-emerald-400 underline transition-colors inline-flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  Sign in with API key
                </button>
              </p>
            )}

            {/* Developer note about social auth */}
            {(mode === 'signup' || mode === 'login') && (
              <div className="rounded-lg bg-slate-900/50 border border-slate-800/60 px-4 py-3 flex items-start gap-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-600 text-left leading-relaxed">
                  <span className="text-slate-500 font-medium">Google & GitHub login coming soon.</span>{' '}
                  For now, create an account with your email — it takes 10 seconds and you can sign back in any time with your email + password.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
