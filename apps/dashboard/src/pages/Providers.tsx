import React, { useEffect, useState } from 'react';
import {
  Layers, Copy, Check, ExternalLink, ShieldCheck,
  RefreshCw, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { api } from '../lib/api';

// ── Static descriptions & website URLs (not in DB) ──────────────────────────
const PROVIDER_META: Record<string, { description: string; website: string }> = {
  firecrawl:   { description: 'Turn any web page into LLM-ready markdown with one call.',        website: 'https://firecrawl.dev' },
  jina:        { description: 'Blazing-fast web reader & clean markdown extractor for LLMs.',     website: 'https://jina.ai' },
  apify:       { description: 'Async actor execution for complex multi-page scraping workflows.',  website: 'https://apify.com' },
  spider:      { description: 'High-concurrency cloud crawler & scraper API.',                    website: 'https://spider.cloud' },
  tavily:      { description: 'AI-optimized search engine built for agents and RAG pipelines.',   website: 'https://tavily.com' },
  exa:         { description: 'Neural web search by embeddings and semantic similarity.',          website: 'https://exa.ai' },
  serper:      { description: 'Real-time Google SERP results via fast REST API.',                  website: 'https://serper.dev' },
  browserbase: { description: 'Headless Chrome sessions in the cloud with full CDP access.',      website: 'https://browserbase.com' },
  steel:       { description: 'Anti-detect cloud browser with built-in captcha solving.',         website: 'https://steel.dev' },
  e2b:         { description: 'Secure isolated Python/JS sandbox for AI code execution.',         website: 'https://e2b.dev' },
};

const ENDPOINT_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  scrape:  { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  search:  { text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  browser: { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  execute: { text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
};

const GROUPS = [
  { title: 'Scraping & Web Parsing',    endpoint: 'scrape' },
  { title: 'AI & Web Search',           endpoint: 'search' },
  { title: 'Cloud Headless Browsers',   endpoint: 'browser' },
  { title: 'Code Execution Sandboxes',  endpoint: 'execute' },
];

interface Provider {
  id: string; name: string; endpoint: string;
  adapter_type: string; response_type: 'sync' | 'async';
  cost_per_call_usd: number; is_live: boolean;
}

export const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.listProviders();
      setProviders(data.providers);
    } catch (e: any) {
      setError(e.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const liveCount = providers.filter(p => p.is_live).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Markup Guarantee</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Provider Catalog — {providers.length || 10} Unified Adapters
        </h1>
        <p className="text-slate-400 text-base">
          You pay exactly what we pay. One prepaid wallet, every upstream tool.
        </p>

        {/* Live status summary */}
        {!loading && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 text-xs font-mono font-bold">{liveCount} LIVE</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600 inline-flex" />
              <span className="text-slate-400 text-xs font-mono">{providers.length - liveCount} offline</span>
            </div>
            <button onClick={load} disabled={loading} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading providers…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 text-center">{error}</div>
      ) : (
        <div className="space-y-12">
          {GROUPS.map((group) => {
            const items = providers.filter(p => p.endpoint === group.endpoint);
            if (!items.length) return null;
            const ec = ENDPOINT_COLOR[group.endpoint] || ENDPOINT_COLOR.scrape;

            return (
              <div key={group.endpoint} className="space-y-4">
                {/* Group header */}
                <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                  <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded ${ec.bg} ${ec.text} ${ec.border} border`}>
                    /v1/{group.endpoint}
                  </span>
                  <h2 className="text-lg font-bold text-white">{group.title}</h2>
                  <span className="text-xs text-slate-500 font-mono">
                    ({items.filter(p => p.is_live).length}/{items.length} live)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(p => {
                    const meta = PROVIDER_META[p.id] || { description: '', website: '#' };
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl glass-card border p-6 flex flex-col justify-between transition-all group ${
                          p.is_live
                            ? 'border-slate-800 hover:border-emerald-500/40'
                            : 'border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top row — name + live badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-bold transition-colors flex items-center gap-1.5 ${
                                p.is_live ? 'text-white group-hover:text-emerald-400' : 'text-slate-500'
                              }`}>
                                {p.name}
                                <a href={meta.website} target="_blank" rel="noreferrer"
                                  className="text-slate-600 hover:text-slate-400 flex-shrink-0">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </h3>
                              {/* Provider ID copy button */}
                              <button
                                onClick={() => handleCopy(p.id)}
                                className="mt-1 text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1"
                              >
                                <span>id: {p.id}</span>
                                {copiedId === p.id
                                  ? <Check className="w-3 h-3 text-emerald-400" />
                                  : <Copy className="w-3 h-3 text-slate-600" />}
                              </button>
                            </div>

                            {/* Live / Offline status */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase flex-shrink-0 border ${
                              p.is_live
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800/60 text-slate-500 border-slate-700'
                            }`}>
                              {p.is_live ? (
                                <>
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                  </span>
                                  Live
                                </>
                              ) : (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 inline-flex" />
                                  Offline
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">{meta.description}</p>

                          {/* Tags row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              p.response_type === 'async'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {p.response_type}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${ec.bg} ${ec.text} ${ec.border}`}>
                              {p.adapter_type}
                            </span>
                          </div>
                        </div>

                        {/* Cost */}
                        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-mono">Wholesale Cost:</span>
                          <div className={`text-sm font-bold font-mono ${p.is_live ? 'text-emerald-400' : 'text-slate-500'}`}>
                            ${p.cost_per_call_usd.toFixed(4)}
                            <span className="text-[10px] text-slate-500 font-normal"> / call</span>
                          </div>
                        </div>
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
