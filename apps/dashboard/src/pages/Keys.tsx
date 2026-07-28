import React, { useEffect, useState } from 'react';
import {
  Key, Plus, Trash2, Check, Eye, EyeOff, AlertCircle,
  Loader2, ShieldCheck, ExternalLink, RefreshCw, Sparkles,
  ChevronDown, ChevronRight, Lock, Unlock, Info
} from 'lucide-react';
import { api } from '../lib/api';

// ── Static metadata (descriptions + websites) ────────────────────────────────
const PROVIDER_META: Record<string, { description: string; website: string }> = {
  firecrawl:   { description: 'Web page → LLM-ready markdown',   website: 'https://firecrawl.dev' },
  jina:        { description: 'Ultra-fast web reader & extractor', website: 'https://jina.ai' },
  apify:       { description: 'Async multi-page crawling actors',  website: 'https://apify.com' },
  spider:      { description: 'High-concurrency cloud crawler',    website: 'https://spider.cloud' },
  tavily:      { description: 'AI-optimized web search for RAG',   website: 'https://tavily.com' },
  exa:         { description: 'Neural embedding web search',       website: 'https://exa.ai' },
  serper:      { description: 'Real-time Google SERP results',     website: 'https://serper.dev' },
  browserbase: { description: 'Cloud Chromium + CDP sessions',     website: 'https://browserbase.com' },
  steel:       { description: 'Anti-detect browser + captcha',     website: 'https://steel.dev' },
  e2b:         { description: 'Isolated Python/JS code sandbox',   website: 'https://e2b.dev' },
};

const ENDPOINT_BADGE: Record<string, { label: string; text: string; bg: string; border: string }> = {
  scrape:  { label: '/v1/scrape',  text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  search:  { label: '/v1/search',  text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  browser: { label: '/v1/browser', text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  execute: { label: '/v1/execute', text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
};

// All 10 providers (static list — shown even if user has no keys yet)
const ALL_PROVIDERS = [
  { id: 'firecrawl',   name: 'Firecrawl',    endpoint: 'scrape' },
  { id: 'jina',        name: 'Jina AI',       endpoint: 'scrape' },
  { id: 'apify',       name: 'Apify',         endpoint: 'scrape' },
  { id: 'spider',      name: 'Spider Cloud',  endpoint: 'scrape' },
  { id: 'tavily',      name: 'Tavily',        endpoint: 'search' },
  { id: 'exa',         name: 'Exa AI',        endpoint: 'search' },
  { id: 'serper',      name: 'Serper',        endpoint: 'search' },
  { id: 'browserbase', name: 'Browserbase',   endpoint: 'browser' },
  { id: 'steel',       name: 'Steel Browser', endpoint: 'browser' },
  { id: 'e2b',         name: 'E2B Sandbox',   endpoint: 'execute' },
];

interface ByokKey {
  provider_id: string;
  provider_name: string;
  endpoint: string;
  platform_cost_usd: number;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export const Keys: React.FC = () => {
  const [byokKeys, setByokKeys]       = useState<ByokKey[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [labelValues, setLabelValues] = useState<Record<string, string>>({});
  const [showKey, setShowKey]         = useState<Record<string, boolean>>({});
  const [saving, setSaving]           = useState<Record<string, boolean>>({});
  const [deleting, setDeleting]       = useState<Record<string, boolean>>({});
  const [toasts, setToasts]           = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.listKeys();
      setByokKeys(data.keys);
    } catch (e: any) {
      setError(e.message || 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (id: string, msg: string) => {
    setToasts(prev => ({ ...prev, [id]: msg }));
    setTimeout(() => setToasts(prev => { const n = { ...prev }; delete n[id]; return n; }), 3000);
  };

  const handleSave = async (providerId: string) => {
    const rawKey = inputValues[providerId]?.trim();
    if (!rawKey) return;
    setSaving(prev => ({ ...prev, [providerId]: true }));
    try {
      await api.addKey(providerId, rawKey, labelValues[providerId] || undefined);
      showToast(providerId, '✅ Key saved successfully');
      setInputValues(prev => ({ ...prev, [providerId]: '' }));
      setExpandedId(null);
      await load();
    } catch (e: any) {
      showToast(providerId, `❌ ${e.message || 'Failed to save key'}`);
    } finally {
      setSaving(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleDelete = async (providerId: string) => {
    setDeleting(prev => ({ ...prev, [providerId]: true }));
    try {
      await api.deleteKey(providerId);
      showToast(providerId, '🗑️ Key removed — now using platform key');
      await load();
    } catch (e: any) {
      showToast(providerId, `❌ ${e.message || 'Failed to remove key'}`);
    } finally {
      setDeleting(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const byokMap = new Map(byokKeys.map(k => [k.provider_id, k]));
  const byokCount = byokKeys.length;

  // Group by endpoint
  const GROUPS = ['scrape', 'search', 'browser', 'execute'];
  const GROUP_LABELS: Record<string, string> = {
    scrape: 'Scraping & Web Parsing',
    search: 'AI & Web Search',
    browser: 'Cloud Headless Browsers',
    execute: 'Code Execution Sandboxes',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-emerald-400" />
              Bring Your Own Keys (BYOK)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add your own upstream API keys. When active, LiteDaemon routes your calls through your own account at <span className="text-emerald-400 font-mono">$0.00</span> wallet cost.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono">
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{byokCount} BYOK</span>
            <span className="text-slate-400">keys active</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">{10 - byokCount} using platform keys</span>
          </div>
        </div>

        {/* How It Works banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-5 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1.5">
            <p className="text-slate-200 font-semibold text-sm">How BYOK Works</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { n: '1', text: 'Add your own API key for any provider below.' },
                { n: '2', text: 'API calls to that provider use your key — your upstream account is billed directly.' },
                { n: '3', text: 'Your LiteDaemon wallet balance is NOT debited — cost = $0.00 per call.' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{s.n}</span>
                  <span className="leading-relaxed">{s.text}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-500 pt-1 flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              All keys are AES-256-GCM encrypted. Raw keys are never stored or logged.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your keys…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map(endpoint => {
            const groupProviders = ALL_PROVIDERS.filter(p => p.endpoint === endpoint);
            const ep = ENDPOINT_BADGE[endpoint];

            return (
              <div key={endpoint} className="space-y-2">
                {/* Group Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${ep.bg} ${ep.text} ${ep.border}`}>
                    {ep.label}
                  </span>
                  <span className="text-white font-semibold text-sm">{GROUP_LABELS[endpoint]}</span>
                  <span className="text-slate-500 text-xs font-mono">
                    {groupProviders.filter(p => byokMap.has(p.id)).length}/{groupProviders.length} BYOK
                  </span>
                </div>

                <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800/70">
                  {groupProviders.map(p => {
                    const existing  = byokMap.get(p.id);
                    const isExpanded = expandedId === p.id;
                    const isSaving  = !!saving[p.id];
                    const isDeleting = !!deleting[p.id];
                    const toast     = toasts[p.id];
                    const meta      = PROVIDER_META[p.id] || { description: '', website: '#' };
                    const showRaw   = !!showKey[p.id];

                    return (
                      <div key={p.id} className="transition-colors">
                        {/* Row */}
                        <div
                          className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/30 transition-colors ${isExpanded ? 'bg-slate-800/20' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        >
                          {/* Status indicator */}
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${existing ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-700'}`} />

                          {/* Provider Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-white">{p.name}</span>
                              <a
                                href={meta.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-slate-600 hover:text-slate-400"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <span className="text-[10px] font-mono text-slate-500 hidden sm:block">{meta.description}</span>
                            </div>
                          </div>

                          {/* BYOK Status */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {existing ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  BYOK Active
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">$0.00/call</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">Platform key</span>
                                <span className="text-[10px] font-mono text-amber-400/70">${byokMap.get(p.id)?.platform_cost_usd?.toFixed(4) ?? '—'}/call</span>
                              </div>
                            )}
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4 text-slate-500" />
                              : <ChevronRight className="w-4 h-4 text-slate-500" />
                            }
                          </div>
                        </div>

                        {/* Toast notification */}
                        {toast && (
                          <div className="mx-4 mb-3 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                            {toast}
                          </div>
                        )}

                        {/* Expanded Panel */}
                        {isExpanded && (
                          <div className="px-4 pb-5 pt-2 border-t border-slate-800/60 bg-slate-900/30 space-y-4">

                            {/* Existing key info */}
                            {existing && (
                              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-mono uppercase text-slate-500">Active BYOK Key</p>
                                  <p className="font-mono text-sm text-emerald-400">
                                    {showRaw ? 'sk-••••••••••••••••••••' : 'sk-••••••••••••••••••••'}
                                    <span className="text-slate-500 text-xs ml-2">(encrypted — never readable)</span>
                                  </p>
                                  {existing.label && (
                                    <p className="text-xs text-slate-400">Label: <span className="text-white">{existing.label}</span></p>
                                  )}
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    Added: {timeAgo(existing.created_at)}
                                    {existing.last_used_at && ` · Last used: ${timeAgo(existing.last_used_at)}`}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  disabled={isDeleting}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-mono transition-all"
                                >
                                  {isDeleting
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />
                                  }
                                  Remove
                                </button>
                              </div>
                            )}

                            {/* Add / Replace key form */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                                {existing ? 'Replace Key' : 'Add Your Key'}
                              </label>

                              <div className="relative">
                                <input
                                  type={showRaw ? 'text' : 'password'}
                                  value={inputValues[p.id] || ''}
                                  onChange={e => setInputValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder={`Paste your ${p.name} API key here…`}
                                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-[#0a0d14] border border-slate-800 focus:border-emerald-500/50 focus:outline-none text-white font-mono text-xs placeholder-slate-600 transition-colors"
                                />
                                <button
                                  onClick={() => setShowKey(prev => ({ ...prev, [p.id]: !showRaw }))}
                                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                                >
                                  {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>

                              <input
                                type="text"
                                value={labelValues[p.id] || ''}
                                onChange={e => setLabelValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                                placeholder="Optional label (e.g. production, personal)…"
                                className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 focus:border-slate-600 focus:outline-none text-slate-300 font-mono text-xs placeholder-slate-600 transition-colors"
                              />

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleSave(p.id)}
                                  disabled={isSaving || !inputValues[p.id]?.trim()}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
                                >
                                  {isSaving
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Check className="w-3.5 h-3.5" />
                                  }
                                  {existing ? 'Replace & Save' : 'Save Key'}
                                </button>

                                <a
                                  href={meta.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Get key from {p.name}
                                </a>
                              </div>

                              <p className="text-[10px] text-slate-600 font-mono flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-slate-600" />
                                Key is encrypted with AES-256-GCM before storage. LiteDaemon never logs or returns raw keys.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
