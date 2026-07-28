import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Key, Copy, Check, Eye, EyeOff,
  Shield, User, Wallet, Activity, DollarSign, LogOut,
  Loader2, AlertCircle, Calendar, CreditCard, Terminal
} from 'lucide-react';
import { api, getStoredApiKey, clearStoredApiKey } from '../lib/api';

interface Me {
  email: string;
  plan: string;
  created_at: string;
  balance_usd: number;
  total_calls: number;
  billed_calls: number;
  total_spent_usd: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const Settings: React.FC = () => {
  const navigate   = useNavigate();
  const currentKey = getStoredApiKey();
  const [showKey, setShowKey]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [me, setMe]             = useState<Me | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    api.getMe()
      .then(setMe)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maskedKey = currentKey
    ? `${currentKey.slice(0, 10)}${'•'.repeat(28)}${currentKey.slice(-6)}`
    : 'No active key';

  const copyKey = () => {
    if (!currentKey) return;
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/scrape \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"firecrawl","params":{"url":"https://example.com"}}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSignOut = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-400" />
            Account & Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your API key, account info, and usage summary.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-4">
          <User className="w-4 h-4 text-emerald-400" />
          Account Info
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading account…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : me ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Email</p>
              <p className="text-sm font-semibold text-white font-mono">{me.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Plan</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase">
                <CreditCard className="w-3 h-3" /> {me.plan}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Member Since
              </p>
              <p className="text-sm text-slate-300">{formatDate(me.created_at)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">User ID</p>
              <p className="text-xs font-mono text-slate-500 truncate">sha256-hashed (stored securely)</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Usage Stats */}
      {me && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase">
              <span>Balance</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              ${me.balance_usd.toFixed(4)}
            </div>
          </div>
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase">
              <span>API Calls</span>
              <Activity className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {me.total_calls.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase">
              <span>Total Spent</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              ${me.total_spent_usd.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {/* API Key */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Key className="w-4 h-4 text-emerald-400" />
            Master Gateway API Key
          </div>
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Bearer Token</label>
          <div className="flex items-center gap-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
            <code className="flex-1 font-mono text-xs text-emerald-300 break-all">
              {showKey ? currentKey : maskedKey}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0"
              title={showKey ? 'Hide' : 'Reveal'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyKey}
              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex-shrink-0"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security note */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-400 flex items-start gap-3">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-200 font-semibold mb-0.5">Security & Storage Policy</p>
            LiteDaemon stores only the SHA-256 hash of your key in Supabase. The raw key never touches our DB — only you have it. If you lose it, sign up again with your email to get a new one.
          </div>
        </div>
      </div>

      {/* Quick API Reference */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Quick API Reference
          </div>
          <button
            onClick={copyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCurl ? 'Copied!' : 'Copy cURL'}
          </button>
        </div>

        <pre className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
{curlExample}
        </pre>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono">
          {[
            { method: 'POST', path: '/v1/scrape',  color: 'text-emerald-400', note: 'Firecrawl, Jina, Apify, Spider' },
            { method: 'POST', path: '/v1/search',  color: 'text-teal-400',    note: 'Tavily, Exa, Serper' },
            { method: 'POST', path: '/v1/browser', color: 'text-cyan-400',    note: 'Browserbase, Steel' },
            { method: 'POST', path: '/v1/execute', color: 'text-purple-400',  note: 'E2B Sandbox' },
          ].map(e => (
            <div key={e.path} className="rounded-lg bg-[#0a0d14] border border-slate-800 p-2.5 space-y-1">
              <span className={`font-bold ${e.color}`}>{e.method} {e.path}</span>
              <p className="text-slate-600 text-[10px] leading-tight">{e.note}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
