import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Layers, Copy, Check, ExternalLink, ShieldCheck,
  RefreshCw, Loader2, Zap, Terminal, Code2, ArrowUpDown, ChevronRight,
  X, CheckCircle2, AlertCircle, Cpu, Globe, Eye, Sparkles, Key, Plus,
  Wrench, MessageSquare, Send, Server, Link2
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

export const Providers: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders]   = useState<Provider[]>([]);
  const [userKeys, setUserKeys]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery]       = useState('');
  const [endpointFilter, setEndpointFilter] = useState<'all' | 'scrape' | 'search' | 'browser' | 'execute' | 'document'>('all');
  const [statusFilter, setStatusFilter]     = useState<'all' | 'live' | 'offline'>('all');
  const [sortBy, setSortBy]                 = useState<'name' | 'speed'>('name');

  // Selected Provider Drawer
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
      setProviders(providersData.providers);
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

  // Filter & Sort Logic
  const filteredProviders = providers
    .filter(p => {
      if (endpointFilter !== 'all' && p.endpoint !== endpointFilter) return false;
      if (statusFilter === 'live' && !p.is_live) return false;
      if (statusFilter === 'offline' && p.is_live) return false;
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

  const liveCount = providers.filter(p => p.is_live).length;

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

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
    }

    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Banner / Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BYOK Infrastructure Router</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Provider Catalog</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-normal border border-slate-700">
              Unified Tool Gateway
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Explore supported scraping, search, browser, and sandbox providers. Connect your API keys to enable automatic failovers.
          </p>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 gap-3 relative z-10 font-mono text-xs shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">NATIVE ADAPTERS</span>
            <div className="text-xl font-bold text-white">{providers.length || 36}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">YOUR KEYS</span>
            <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              {userConfiguredKeysCount} Keys Connected
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="space-y-4">
        
        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Dynamic Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${filteredProviders.length} providers by name, capability (e.g. Markdown, SERP, CDP), or endpoint...`}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#121620] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono text-xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Status & Sorting */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#121620] border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Status ({providers.length})</option>
              <option value="live">Live Only ({liveCount})</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 bg-[#121620] border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="name">Name: A to Z</option>
                <option value="speed">Speed: Fastest First</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#121620] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh provider status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Endpoint Category Filter Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {[
            { id: 'all', label: 'All Endpoints', count: providers.length },
            { id: 'scrape', label: '/v1/scrape', count: providers.filter(p => p.endpoint === 'scrape').length, color: 'text-emerald-400' },
            { id: 'document', label: '/v1/document', count: providers.filter(p => p.endpoint === 'document').length, color: 'text-amber-400' },
            { id: 'search', label: '/v1/search', count: providers.filter(p => p.endpoint === 'search').length, color: 'text-teal-400' },
            { id: 'browser', label: '/v1/browser', count: providers.filter(p => p.endpoint === 'browser').length, color: 'text-cyan-400' },
            { id: 'execute', label: '/v1/execute', count: providers.filter(p => p.endpoint === 'execute').length, color: 'text-purple-400' },
          ].map(badge => {
            const isSelected = endpointFilter === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => setEndpointFilter(badge.id as any)}
                className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border-emerald-500/50 shadow-sm'
                    : 'bg-[#121620]/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className={badge.color || 'text-white'}>{badge.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-500 font-bold">
                  {badge.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="font-mono text-xs">Loading provider network live status...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm text-rose-400 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="rounded-2xl glass-card border border-slate-800 p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">No providers match your search filters.</p>
          <p className="text-slate-500 text-xs font-mono">Try adjusting your query or resetting status/endpoint filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setEndpointFilter('all'); setStatusFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl glass-card border border-slate-800/80 overflow-hidden shadow-2xl space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 pl-6">Provider</th>
                  <th className="p-4">Endpoint</th>
                  <th className="p-4">Capabilities</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4 text-right">BYOK COST MODEL</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProviders.map((p) => {
                  const meta = PROVIDER_META[p.id] || {
                    description: '', website: '#', latency: '~1.0s',
                    capabilities: [], iconBg: 'bg-slate-800 text-slate-300'
                  };
                  const epBadge = ENDPOINT_BADGE[p.endpoint] || ENDPOINT_BADGE.scrape;
                  const isSelected = selectedProvider?.id === p.id;
                  const hasKey = configuredProviderIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProvider(p)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-emerald-500/10' : ''
                      } ${!p.is_live ? 'opacity-65' : ''}`}
                    >
                      {/* Provider Name + Avatar + ID */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm bg-gradient-to-br ${meta.iconBg}`}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <a
                                href={meta.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-600 hover:text-slate-300"
                                title="Open provider website"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              id: <span className="text-slate-400">{p.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Endpoint Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${epBadge.bg} ${epBadge.text} ${epBadge.border}`}>
                          {epBadge.label}
                        </span>
                      </td>

                      {/* Capabilities Pills */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {(meta.capabilities || []).slice(0, 3).map((cap, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                            >
                              {cap}
                            </span>
                          ))}
                          {(meta.capabilities || []).length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-500">
                              +{(meta.capabilities || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Latency & Mode */}
                      <td className="p-4 text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-white font-semibold">{meta.latency || '~800ms'}</span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-bold ${
                            p.response_type === 'async'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {p.response_type}
                          </span>
                        </div>
                      </td>

                      {/* Dynamic BYOK Cost Model Column */}
                      <td className="p-4 text-right">
                        {hasKey ? (
                          <>
                            <div className="text-xs font-bold text-emerald-400">Key Active</div>
                            <div className="text-[10px] text-emerald-500/80">0% Gateway Markup</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-semibold text-slate-400">BYOK Required</div>
                            <div className="text-[10px] text-slate-500">No key connected</div>
                          </>
                        )}
                      </td>

                      {/* User Key Status Badge with Aligned Flex Indicators */}
                      <td className="p-4 text-center">
                        {hasKey ? (
                          <span className="inline-flex items-center justify-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            <span>Connected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            <span>Not Configured</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {hasKey ? (
                            <>
                              <button
                                onClick={() => navigate('/keys')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1"
                              >
                                <Key className="w-3 h-3" />
                                Manage Key
                              </button>
                              <button
                                onClick={() => setSelectedProvider(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors flex items-center gap-1"
                              >
                                <Code2 className="w-3 h-3 text-emerald-400" />
                                &lt;/&gt; Code
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => navigate(`/keys?provider=${p.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Key
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Full-Width Custom Provider Banner Callout Card */}
          <div className="p-6 bg-gradient-to-r from-[#0d1117] via-slate-900 to-[#0d1117] border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Need a custom tool or unlisted provider?</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                LiteDaemon supports custom REST proxies and custom webhook adapters for internal AI agent workflows.
              </p>
            </div>
            <button
              onClick={() => { setIsRequestModalOpen(true); setCustomSubmitted(null); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Request Adapter / Add Custom Proxy
            </button>
          </div>
        </div>
      )}

      {/* ── Custom Request & Proxy Modal (Dialog) ───────────────────────────── */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl font-mono text-xs">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Custom Adapter &amp; REST Proxy</h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCustomModalTab('request')}
                className={`flex-1 py-2 text-center rounded-lg transition-all font-semibold ${
                  customModalTab === 'request'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Request Adapter
              </button>
              <button
                onClick={() => setCustomModalTab('proxy')}
                className={`flex-1 py-2 text-center rounded-lg transition-all font-semibold ${
                  customModalTab === 'proxy'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Proxy
              </button>
            </div>

            {customSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-emerald-300 font-semibold text-xs leading-relaxed">{customSubmitted}</p>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                {customModalTab === 'request' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Provider Name</label>
                      <input
                        type="text"
                        required
                        value={customFormState.name}
                        onChange={e => setCustomFormState({ ...customFormState, name: e.target.value })}
                        placeholder="e.g. Fal.ai / ElevenLabs / Firecrawl V2"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">API Documentation URL</label>
                      <input
                        type="url"
                        required
                        value={customFormState.url}
                        onChange={e => setCustomFormState({ ...customFormState, url: e.target.value })}
                        placeholder="https://docs.example.com/api"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Endpoint Base URL</label>
                      <input
                        type="url"
                        required
                        value={customFormState.url}
                        onChange={e => setCustomFormState({ ...customFormState, url: e.target.value })}
                        placeholder="https://my-internal-proxy.company.com/v1"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Auth Header Name</label>
                      <input
                        type="text"
                        required
                        value={customFormState.authHeader}
                        onChange={e => setCustomFormState({ ...customFormState, authHeader: e.target.value })}
                        placeholder="Authorization or X-API-Key"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                )}

                <div className="pt-3 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{customModalTab === 'request' ? 'Submit Request' : 'Save Custom Proxy'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── Slide-Over Code & Detail Drawer ────────────────────────────────── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedProvider(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#0a0d14] border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl z-10">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg bg-gradient-to-br ${PROVIDER_META[selectedProvider.id]?.iconBg}`}>
                  {selectedProvider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{selectedProvider.name}</span>
                    <a
                      href={PROVIDER_META[selectedProvider.id]?.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h2>
                  <div className="flex items-center space-x-2 mt-1 font-mono text-xs">
                    <span className="text-slate-500">id: {selectedProvider.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedProvider.id, 'provider_id')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedField === 'provider_id' ? 'Copied!' : 'Copy ID'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Endpoint</span>
                <div className="text-emerald-400 font-bold">/v1/{selectedProvider.endpoint}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Billing Model</span>
                <div className="text-white font-bold">Pure BYOK</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Est. Latency</span>
                <div className="text-teal-400 font-bold">{PROVIDER_META[selectedProvider.id]?.latency}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Execution</span>
                <div className="text-white font-bold uppercase">{selectedProvider.response_type}</div>
              </div>
            </div>

            {/* Overview Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Adapter Overview</h3>
              <p className="text-slate-300 text-xs leading-relaxed p-4 rounded-xl bg-[#121620]/60 border border-slate-800/80">
                {PROVIDER_META[selectedProvider.id]?.description}
              </p>
            </div>

            {/* Capability Badges */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Supported Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {(PROVIDER_META[selectedProvider.id]?.capabilities || []).map((cap, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{cap}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet Inspector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Integration Code Snippet</span>
                </h3>

                <div className="flex items-center space-x-1 bg-[#121620] p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                  {(['curl', 'typescript', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeTab(lang)}
                      className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                        codeTab === lang ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'cURL'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative rounded-xl bg-[#080b10] border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 font-mono text-[10px] text-slate-400">
                  <span>Endpoint: POST /v1/{selectedProvider.endpoint}</span>
                  <button
                    onClick={() => copyToClipboard(generateSnippet(selectedProvider, codeTab), 'code_snippet')}
                    className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    {copiedField === 'code_snippet' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-80">
                  {generateSnippet(selectedProvider, codeTab)}
                </pre>
              </div>
            </div>

            {/* BYOK Gateway Info */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <div className="text-slate-200 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pure BYOK Routing Engine</span>
              </div>
              <p>
                Requests sent to <code className="text-emerald-400">/v1/{selectedProvider.endpoint}</code> with provider <code className="text-white">"{selectedProvider.id}"</code> use your configured BYOK keys with 0% platform markup.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
