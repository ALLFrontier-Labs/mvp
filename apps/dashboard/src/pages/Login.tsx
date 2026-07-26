import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Key, Copy, Check, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, setStoredApiKey } from '../lib/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.signup(email);
      setCreatedApiKey(res.api_key);
      setStoredApiKey(res.api_key);
    } catch (err: any) {
      if (err.message?.includes('already_registered')) {
        setError('This email is already registered. If you already have an API key, you can enter it below.');
      } else {
        setError(err.message || 'Signup failed');
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Developer Sign In</h2>
          <p className="mt-2 text-sm text-slate-400">
            One API Key. Prepaid Wallet. Zero Margin on 10 AI Tools.
          </p>
        </div>

        {/* API Key Banner if just generated */}
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
        ) : (
          /* Signup / Existing Key Form */
          <form onSubmit={handleSubmit} className="rounded-2xl bg-[#121620]/80 border border-slate-800 p-8 shadow-2xl space-y-6">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Work / Developer Email
              </label>
              <input
                id="email"
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
        )}

      </div>
    </div>
  );
};
