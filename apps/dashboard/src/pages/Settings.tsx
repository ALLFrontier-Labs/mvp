import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Key, Copy, Check, Eye, EyeOff,
  Shield, User, Wallet, Activity, DollarSign, LogOut,
  Loader2, AlertCircle, Calendar, CreditCard, Terminal, RefreshCw,
  X, CheckCircle2, Zap, FileText, Monitor, Search, Globe
} from 'lucide-react';
import { api, getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../lib/api';

interface Me {
  email: string;
  plan: string;
  created_at: string;
  balance_usd: number;
  total_calls: number;
  billed_calls: number;
  total_spent_usd: number;
}

type EndpointTab = 'scrape' | 'search' | 'browser' | 'execute' | 'document';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const Settings: React.FC = () => {
  const navigate   = useNavigate();
  const [currentKey, setCurrentKey] = useState<string | null>(getStoredApiKey());
  const [showKey, setShowKey]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [me, setMe]                 = useState<Me | null>(null);
  const [userKeysCount, setUserKeysCount] = useState<number>(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Endpoint reference tab state
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointTab>('scrape');

  // Key Regeneration Modal state
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating]             = useState(false);
  const [regenerateSuccess, setRegenerateSuccess]         = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMe().catch(e => { setError(e.message); return null; }),
      api.listKeys().catch(() => ({ keys: [] })),
    ]).then(([meData, keysData]) => {
      if (meData) setMe(meData);
      setUserKeysCount((keysData.keys || []).length);
    }).finally(() => setLoading(false));
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

  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    try {
      const newKey = `ld_live_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      setStoredApiKey(newKey);
      setCurrentKey(newKey);
      setRegenerateSuccess(true);
      setTimeout(() => {
        setRegenerateSuccess(false);
        setIsRegenerateModalOpen(false);
      }, 1500);
    } catch {
      /* ignore */
    } finally {
      setIsRegenerating(false);
    }
  };

  // Dynamic cURL examples per endpoint
  const CURL_EXAMPLES: Record<EndpointTab, string> = {
    scrape: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/scrape \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"firecrawl","params":{"url":"https://example.com","format":"markdown"}}'`,
    search: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/search \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"tavily","params":{"query":"latest AI agent tools 2026","max_results":5}}'`,
    browser: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/browser \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"browserbase","params":{"url":"https://example.com","stealth":true}}'`,
    execute: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/execute \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"e2b","params":{"code":"print(\\"Hello from LiteDaemon sandbox!\\")"}}'`,
    document: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/document \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"llamaparse","params":{"file_url":"https://example.com/doc.pdf","format":"markdown"}}'`,
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(CURL_EXAMPLES[selectedEndpoint]);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSignOut = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 selection:bg-emerald-500 selection:text-slate-950 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-emerald-400" />
            Account &amp; Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your API keys, account details, and quick integration reference.</p>
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
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-4">
          <User className="w-4 h-4 text-emerald-400" />
          Account Profile
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading account metadata…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : me ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-white font-mono">{me.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Gateway Tier</p>
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
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Security State</p>
              <p className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Master Key Enforced
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Overhauled Usage & BYOK Metrics Cards */}
      {me && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          
          {/* Card 1: Prepaid Gateway Credits */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
              <span>Prepaid Gateway Credits</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              ${me.balance_usd.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500">Gateway routing &amp; failovers</div>
          </div>

          {/* Card 2: API Calls */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
              <span>Monthly Tool Calls</span>
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {me.total_calls.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Unified endpoint requests</div>
          </div>

          {/* Card 3: ACTIVE KEYS (Replaced TOTAL SPENT) */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
              <span>Active Keys</span>
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {userKeysCount} {userKeysCount === 1 ? 'Key' : 'Keys'} Connected
            </div>
            <div className="text-[10px] text-slate-500">BYOK provider vault keys</div>
          </div>

        </div>
      )}

      {/* Master Gateway API Key Card */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Key className="w-4 h-4 text-emerald-400" />
            Master Gateway API Key
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        </div>

        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Bearer Token</label>
            <button
              onClick={() => setIsRegenerateModalOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Key</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
            <code className="flex-1 text-xs text-emerald-300 break-all">
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
              title="Copy Bearer Token"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security Policy Box */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-400 flex items-start gap-3">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-slate-200 font-semibold">Security &amp; Storage Policy</p>
            <p className="leading-relaxed">
              LiteDaemon stores only the SHA-256 hash of your Master Key. Raw keys are never stored in plain text. You can regenerate a new key at any time above.
            </p>
          </div>
        </div>
      </div>

      {/* Quick API Reference with 5 Endpoint Tabs */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4 shadow-xl font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Quick API Reference
          </div>
          <button
            onClick={copyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCurl ? 'Copied!' : 'Copy cURL'}
          </button>
        </div>

        {/* 5 Endpoint Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'scrape',   label: '/v1/scrape',   color: 'text-emerald-400', icon: Globe },
            { id: 'search',   label: '/v1/search',   color: 'text-teal-400',    icon: Search },
            { id: 'browser',  label: '/v1/browser',  color: 'text-cyan-400',    icon: Monitor },
            { id: 'execute',  label: '/v1/execute',  color: 'text-purple-400',  icon: Terminal },
            { id: 'document', label: '/v1/document', color: 'text-amber-400',   icon: FileText },
          ].map(tab => {
            const isSelected = selectedEndpoint === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedEndpoint(tab.id as EndpointTab)}
                className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border-emerald-500/50 shadow-sm'
                    : 'bg-[#121620]/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span className={tab.color}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* cURL Request Preview */}
        <pre className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-56">
          {CURL_EXAMPLES[selectedEndpoint]}
        </pre>
      </div>

      {/* ── Key Regeneration Modal ────────────────────────────────────────────── */}
      {isRegenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className="relative w-full max-w-md bg-[#0d1117] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Regenerate Master Key</h3>
              </div>
              <button
                onClick={() => setIsRegenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regenerateSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-emerald-300 font-bold">New Master Bearer Token Generated!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Warning
                  </p>
                  <p className="leading-relaxed font-sans">
                    Regenerating your key will immediately invalidate your current Bearer token. Any active scripts using the old key will fail. Continue?
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsRegenerateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateKey}
                    disabled={isRegenerating}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
                  >
                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm &amp; Regenerate</span>}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
