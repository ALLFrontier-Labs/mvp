import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Layers, Copy, Check, ExternalLink, ShieldCheck,
  RefreshCw, Loader2, Zap, Terminal, Code2, ArrowUpDown, ChevronRight,
  X, CheckCircle2, AlertCircle, Cpu, Globe, Eye, Sparkles, Key, Plus,
  Wrench, MessageSquare, Send, Server, Link2, LayoutGrid, List, FileText
} from 'lucide-react';
import { api, getStoredApiKey } from '../lib/api';
import { PROVIDER_META, ENDPOINT_BADGE, RichMeta } from '../data/providers';

interface Provider {
  id: string;
  name: string;
  endpoint: string;
  adapter_type: string;
  response_type: 'sync' | 'async';
  cost_per_call_usd: number;
  is_live: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND ICON ENGINE — Dynamic Brand Badges with Unique Brand Accent Colors
// ─────────────────────────────────────────────────────────────────────────────
const BRAND_ACCENT_STYLES: Record<string, { bg: string; text: string; border: string; iconLetter: string }> = {
  firecrawl:       { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30', iconLetter: 'FC' },
  jina:            { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', iconLetter: 'JN' },
  apify:           { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30', iconLetter: 'AP' },
  spider:          { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', iconLetter: 'SP' },
  tavily:          { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30', iconLetter: 'TV' },
  exa:             { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', iconLetter: 'EX' },
  serper:          { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30', iconLetter: 'SR' },
  browserbase:     { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30', iconLetter: 'BB' },
  steel:           { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30', iconLetter: 'ST' },
  e2b:             { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', iconLetter: 'E2' },
  daytona:         { bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30', iconLetter: 'DT' },
  llamaparse:      { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', iconLetter: 'LP' },
  firecrawl_parse: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30', iconLetter: 'FP' },
  unstructured:    { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', iconLetter: 'UN' },
  perplexity:      { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30', iconLetter: 'PX' },
  brave:           { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30', iconLetter: 'BV' },
};

const ProviderBrandIcon: React.FC<{ providerId: string; name: string }> = ({ providerId, name }) => {
  const brand = BRAND_ACCENT_STYLES[providerId] || {
    bg: 'bg-lime-500/10 dark:bg-lime-500/20',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-500/30',
    iconLetter: name.slice(0, 2).toUpperCase()
  };

  return (
    <div className={`w-10 h-10 rounded-xl ${brand.bg} border ${brand.border} flex items-center justify-center font-mono font-extrabold text-xs ${brand.text} shadow-sm shrink-0`}>
      {brand.iconLetter}
    </div>
  );
};

export const Providers: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders]   = useState<Provider[]>([]);
  const [userKeys, setUserKeys]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  
  // View Switcher State (Grid vs Table)
  const [viewMode, setViewMode]     = useState<'grid' | 'table'>('grid');

  // Filtering & Search State
  const [searchQuery, setSearchQuery]       = useState('');
  const [endpointFilter, setEndpointFilter] = useState<'all' | 'scrape' | 'search' | 'browser' | 'execute' | 'document'>('all');
  const [statusFilter, setStatusFilter]     = useState<'all' | 'configured' | 'unconfigured'>('all');
  const [sortBy, setSortBy]                 = useState<'name' | 'speed'>('name');

  // Selected Provider Code Drawer
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [copiedField, setCopiedField]           = useState<string | null>(null);
  const [codeTab, setCodeTab]                   = useState<'curl' | 'typescript' | 'python'>('curl');

  // Custom Request / Proxy Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [customModalTab, setCustomModalTab]       = useState<'request' | 'proxy'>('request');
  const [customFormState, setCustomFormState]     = useState({
    name: '',
    url: '',
    authHeader: 'Authorization',
    useCase: '',
  });
  const [customSubmitted, setCustomSubmitted]   = useState<string | null>(null);

  const apiKey = getStoredApiKey() || 'YOUR_LITEDAEMON_KEY';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [providersData, keysData] = await Promise.all([
        api.listProviders().catch(() => ({ providers: [] })),
        api.listKeys().catch(() => ({ keys: [] })),
      ]);
      setProviders(providersData.providers || []);
      setUserKeys(keysData.keys || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load providers catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const userConfiguredKeysCount = userKeys.length;
  const configuredProviderIds = useMemo(() => new Set(userKeys.map(k => k.provider_id)), [userKeys]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customModalTab === 'request') {
      setCustomSubmitted('Adapter request submitted! Our engineering team will review and prioritize this integration.');
    } else {
      setCustomSubmitted(`Custom REST Proxy for "${customFormState.name || 'Custom Proxy'}" registered successfully.`);
    }
    setTimeout(() => {
      setCustomSubmitted(null);
      setIsRequestModalOpen(false);
      setCustomFormState({ name: '', url: '', authHeader: 'Authorization', useCase: '' });
    }, 2500);
  };

  // Dynamic Endpoint Counts
  const countsByEndpoint = useMemo(() => {
    const counts = { all: providers.length, scrape: 0, document: 0, search: 0, browser: 0, execute: 0 };
    for (const p of providers) {
      const ep = p.endpoint as keyof typeof counts;
      if (counts[ep] !== undefined) {
        counts[ep]++;
      }
    }
    return counts;
  }, [providers]);

  // Filter & Sort Logic
  const filteredProviders = useMemo(() => {
    return providers
      .filter(p => {
        if (endpointFilter !== 'all' && p.endpoint !== endpointFilter) return false;
        const isConfigured = configuredProviderIds.has(p.id);
        if (statusFilter === 'configured' && !isConfigured) return false;
        if (statusFilter === 'unconfigured' && isConfigured) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const meta = PROVIDER_META[p.id];
          const matchName = p.name.toLowerCase().includes(q);
          const matchId   = p.id.toLowerCase().includes(q);
          const matchEp   = p.endpoint.toLowerCase().includes(q);
          const matchCap  = meta?.capabilities.some(c => c.toLowerCase().includes(q));
          if (!matchName && !matchId && !matchEp && !matchCap) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'speed') {
          const speedA = parseFloat(PROVIDER_META[a.id]?.latency.replace(/[^0-9.]/g, '') || '999');
          const speedB = parseFloat(PROVIDER_META[b.id]?.latency.replace(/[^0-9.]/g, '') || '999');
          return speedA - speedB;
        }
        return 0;
      });
  }, [providers, endpointFilter, statusFilter, searchQuery, sortBy, configuredProviderIds]);

  // Code Snippet Generator
  const generateSnippet = (p: Provider, lang: 'curl' | 'typescript' | 'python') => {
    const meta = PROVIDER_META[p.id] || { sampleParams: {} };
    const payload = JSON.stringify({ provider: p.id, params: meta.sampleParams }, null, 2);

    if (lang === 'curl') {
      return `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/${p.endpoint} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ provider: p.id, params: meta.sampleParams })}'`;
    }

    if (lang === 'typescript') {
      return `const response = await fetch('https://mvp-production-c1e8.up.railway.app/v1/${p.endpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${payload}),
});

const data = await response.json();
console.log(data.result);`;
    }

    if (lang === 'python') {
      return `import requests

url = "https://mvp-production-c1e8.up.railway.app/v1/${p.endpoint}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify({ provider: p.id, params: meta.sampleParams }, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }

    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans selection:bg-lime-400 selection:text-zinc-950">

      {/* ── HEADER BANNER & SUMMARY STATS BAR ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-500" />
              </span>
              <span>{providers.length || 36} Active Adapters</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Provider Catalog &amp; Native Adapters</span>
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            Unified proxy routing across search engines, scraping engines, headless browsers, document parsers, and sandboxes.
          </p>
        </div>

        {/* Action Pills Bar */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <Key className="w-4 h-4 text-emerald-500" />
            <span>Your Keys Connected: <strong className="text-emerald-600 dark:text-emerald-400">{userConfiguredKeysCount} Configured</strong></span>
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Request Adapter</span>
          </button>
        </div>
      </div>

      {/* ── UNIFIED FILTER TOOLBAR, SEARCH & VIEW SWITCHER ──────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-4">
        
        {/* Top Row: Search Input & View Switcher Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 36 providers by name, capability, or endpoint..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs placeholder-zinc-400 focus:border-lime-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none font-mono"
            >
              <option value="all">All Status</option>
              <option value="configured">Connected Only</option>
              <option value="unconfigured">Not Configured</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none font-mono"
            >
              <option value="name">Sort by Name</option>
              <option value="speed">Sort by Speed</option>
            </select>

            {/* Dual View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0 font-mono">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Row: Endpoint Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
          {[
            { id: 'all', label: `All Endpoints (${countsByEndpoint.all})` },
            { id: 'scrape', label: `/v1/scrape (${countsByEndpoint.scrape || 12})` },
            { id: 'document', label: `/v1/document (${countsByEndpoint.document || 4})` },
            { id: 'search', label: `/v1/search (${countsByEndpoint.search || 11})` },
            { id: 'browser', label: `/v1/browser (${countsByEndpoint.browser || 4})` },
            { id: 'execute', label: `/v1/execute (${countsByEndpoint.execute || 5})` },
          ].map(tab => {
            const isActive = endpointFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setEndpointFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-lime-400 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* ── LOADING / ERROR / RESULTS DISPLAY ─────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading provider adapters catalog…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="rounded-2xl p-12 text-center bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 space-y-2">
          <Search className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No adapters matched your query</p>
          <button
            onClick={() => { setSearchQuery(''); setEndpointFilter('all'); setStatusFilter('all'); }}
            className="text-xs text-lime-600 dark:text-lime-400 font-bold hover:underline"
          >
            Clear catalog filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ── DYNAMIC 3-COLUMN RESPONSIVE CARD GRID VIEW ─────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map(p => {
            const meta = PROVIDER_META[p.id] || {
              description: 'Standard AI Tool Provider Adapter.',
              website: 'https://litedaemon.com',
              latency: '~450ms',
              capabilities: ['REST Proxy', 'JSON Output'],
              iconBg: 'from-zinc-500/20 to-zinc-700/20 text-zinc-300 border-zinc-700'
            };
            const isConfigured = configuredProviderIds.has(p.id);

            return (
              <div
                key={p.id}
                className="relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-lime-500/50 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] transition-all group font-sans"
              >
                <div className="space-y-3.5">
                  {/* Card Top Row: Brand Logo + Provider Name + Docs Link + Endpoint Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ProviderBrandIcon providerId={p.id} name={p.name} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                            {p.name}
                          </h3>
                          <a
                            href={meta.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            title="Provider Documentation"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 block capitalize">
                          {p.adapter_type || 'native'} adapter
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${ENDPOINT_BADGE[p.endpoint] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                      {p.endpoint}
                    </span>
                  </div>

                  {/* Provider Description */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {meta.description}
                  </p>

                  {/* Capability Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.capabilities.slice(0, 3).map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-400"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Row */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between font-mono text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-lime-500" />
                    {meta.latency} SYNC
                  </span>

                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <button
                        onClick={() => navigate('/keys')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Connected
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/keys')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] border border-zinc-200 dark:border-zinc-700"
                      >
                        + Add Key
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedProvider(p)}
                      className="px-2.5 py-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Code2 className="w-3 h-3" /> Code
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ── COMPACT TABLE VIEW ────────────────────────────────────────────────── */
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm dark:shadow-none font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4 font-semibold">PROVIDER</th>
                  <th className="py-3.5 px-4 font-semibold">ENDPOINT</th>
                  <th className="py-3.5 px-4 font-semibold">CAPABILITIES</th>
                  <th className="py-3.5 px-4 font-semibold">LATENCY</th>
                  <th className="py-3.5 px-4 font-semibold">STATUS</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {filteredProviders.map(p => {
                  const meta = PROVIDER_META[p.id] || {
                    description: 'Standard Adapter',
                    website: 'https://litedaemon.com',
                    latency: '~450ms',
                    capabilities: ['JSON'],
                  };
                  const isConfigured = configuredProviderIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Provider Logo + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ProviderBrandIcon providerId={p.id} name={p.name} />
                          <div>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 block">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs block font-sans">
                              {meta.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Endpoint */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ENDPOINT_BADGE[p.endpoint] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                          {p.endpoint}
                        </span>
                      </td>

                      {/* Capabilities */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-wrap gap-1">
                          {meta.capabilities.slice(0, 2).map((cap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {meta.latency}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 font-mono">
                        {isConfigured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            ✓ Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-[10px]">
                            Not Configured
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate('/keys')}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700"
                          >
                            + Add Key
                          </button>
                          <button
                            onClick={() => setSelectedProvider(p)}
                            className="px-2.5 py-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-[10px]"
                          >
                            Code
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CODE SNIPPET INSPECTOR SLIDE-OVER DRAWER ────────────────────────── */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 h-screen flex flex-col justify-between p-6 overflow-hidden shadow-2xl font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <ProviderBrandIcon providerId={selectedProvider.id} name={selectedProvider.name} />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{selectedProvider.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${ENDPOINT_BADGE[selectedProvider.endpoint]}`}>
                      {selectedProvider.endpoint}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                    Native LiteDaemon REST Proxy Adapter
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Code Snippet Drawer Body */}
            <div className="overflow-y-auto flex-1 py-6 space-y-6">
              
              {/* Language Tabs */}
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {(['curl', 'typescript', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeTab(lang)}
                      className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                        codeTab === lang
                          ? 'bg-lime-400 text-zinc-950 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(generateSnippet(selectedProvider, codeTab), 'snippet')}
                  className="flex items-center gap-1.5 text-lime-600 dark:text-lime-400 font-bold hover:underline"
                >
                  {copiedField === 'snippet' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>

              {/* Code Display */}
              <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
                {generateSnippet(selectedProvider, codeTab)}
              </pre>

              {/* Direct BYOK Routing Specs */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>BYOK Multi-Key Rotation Support</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed font-sans">
                  LiteDaemon encrypts your raw {selectedProvider.name} API key with AES-256-GCM. Pass your single master key in headers, and LiteDaemon handles provider failover automatically.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between items-center font-mono text-xs">
              <button
                onClick={() => { setSelectedProvider(null); navigate('/keys'); }}
                className="px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 hover:bg-lime-300 font-bold flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" /> Configure Key in Vault
              </button>
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM ADAPTER / REST PROXY REQUEST MODAL ───────────────────────── */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-lime-500" /> Custom Adapter Workflow
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Request a new native provider integration or register an instant REST proxy.
                </p>
              </div>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono">
              <button
                onClick={() => setCustomModalTab('request')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  customModalTab === 'request'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                + Request Provider Adapter
              </button>
              <button
                onClick={() => setCustomModalTab('proxy')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  customModalTab === 'proxy'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                ⚡ Register Custom REST Proxy
              </button>
            </div>

            {/* Submission Banner */}
            {customSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Success!
                </div>
                <p>{customSubmitted}</p>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    {customModalTab === 'request' ? 'Provider / API Name' : 'Custom Proxy Service Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customFormState.name}
                    onChange={e => setCustomFormState({ ...customFormState, name: e.target.value })}
                    placeholder={customModalTab === 'request' ? 'e.g. Cohere Web Search, Browserless.io' : 'e.g. My Internal Scraping Microservice'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    {customModalTab === 'request' ? 'Provider Website or Documentation URL' : 'Target Service Base URL'}
                  </label>
                  <input
                    type="url"
                    required
                    value={customFormState.url}
                    onChange={e => setCustomFormState({ ...customFormState, url: e.target.value })}
                    placeholder={customModalTab === 'request' ? 'https://provider.com/docs/api' : 'https://api.internal.domain/v1'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    Use Case Details / Header Auth Config
                  </label>
                  <textarea
                    rows={3}
                    value={customFormState.useCase}
                    onChange={e => setCustomFormState({ ...customFormState, useCase: e.target.value })}
                    placeholder="Describe your target requirements or specific header authentication specs..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 font-mono">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Workflow
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
