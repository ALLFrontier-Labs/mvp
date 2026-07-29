import React, { useEffect, useState, useMemo } from 'react';
import {
  Key, Plus, Trash2, Check, Eye, EyeOff, AlertCircle,
  Loader2, ShieldCheck, ExternalLink, RefreshCw, Sparkles,
  ChevronRight, Lock, Search, ArrowLeft, ArrowUp, ArrowDown,
  Info, X, Zap, Globe, Code2, FileText, Database
} from 'lucide-react';
import { api } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDERS CATALOG FOR BYOK ROUTING
// ─────────────────────────────────────────────────────────────────────────────
export type EndpointCategory = 'all' | 'search' | 'scrape' | 'browser' | 'execute' | 'document';

interface ProviderMeta {
  id: string;
  name: string;
  category: EndpointCategory;
  endpoint: string;
  description: string;
  website: string;
  iconBg: string;
}

const ALL_PROVIDERS: ProviderMeta[] = [
  // Web Search (/v1/search)
  { id: 'tavily',          name: 'Tavily',                   category: 'search',   endpoint: '/v1/search',   description: 'AI-optimized web search for RAG & agents',        website: 'https://tavily.com', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'exa',             name: 'Exa AI',                   category: 'search',   endpoint: '/v1/search',   description: 'Neural search & embedding web retrieval',           website: 'https://exa.ai', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'serper',          name: 'Serper',                   category: 'search',   endpoint: '/v1/search',   description: 'Real-time Google SERP data API',                   website: 'https://serper.dev', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'brave',           name: 'Brave Search',             category: 'search',   endpoint: '/v1/search',   description: 'Privacy-first independent web index API',           website: 'https://brave.com/search/api', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'serpapi',         name: 'SerpAPI',                  category: 'search',   endpoint: '/v1/search',   description: 'Scrape Google, Bing & Yahoo SERP data',            website: 'https://serpapi.com', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'bing',            name: 'Bing Search',              category: 'search',   endpoint: '/v1/search',   description: 'Microsoft Bing Web & News Search API',            website: 'https://azure.microsoft.com', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'google_cse',      name: 'Google Custom Search',      category: 'search',   endpoint: '/v1/search',   description: 'Google Programmable Search API',                   website: 'https://developers.google.com/custom-search', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'zenserp',         name: 'Zenserp',                  category: 'search',   endpoint: '/v1/search',   description: 'Reliable Google, Bing & YouTube SERP scraping',   website: 'https://zenserp.com', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },

  // Scraping & Data Extraction (/v1/scrape)
  { id: 'firecrawl',       name: 'Firecrawl',                category: 'scrape',   endpoint: '/v1/scrape',   description: 'Turn web pages into LLM-ready markdown',           website: 'https://firecrawl.dev', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'jina',            name: 'Jina AI Reader',           category: 'scrape',   endpoint: '/v1/scrape',   description: 'Ultra-fast web reader & content extractor',        website: 'https://jina.ai', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'apify',           name: 'Apify Actors',             category: 'scrape',   endpoint: '/v1/scrape',   description: 'Async multi-page web crawling actors',            website: 'https://apify.com', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'spider',          name: 'Spider Cloud',             category: 'scrape',   endpoint: '/v1/scrape',   description: 'High-concurrency LLM web crawler',                 website: 'https://spider.cloud', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'scrape_do',       name: 'Scrape.do',                category: 'scrape',   endpoint: '/v1/scrape',   description: 'Scalable proxy scraper with JS rendering',         website: 'https://scrape.do', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'scrapingbee',     name: 'ScrapingBee',              category: 'scrape',   endpoint: '/v1/scrape',   description: 'Headless Chrome scraping API with proxy rotation', website: 'https://scrapingbee.com', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'zenrows',         name: 'ZenRows',                  category: 'scrape',   endpoint: '/v1/scrape',   description: 'Anti-bot bypassing web scraper API',               website: 'https://zenrows.com', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'scraperapi',      name: 'ScraperAPI',               category: 'scrape',   endpoint: '/v1/scrape',   description: 'Turnkey scraping API with auto IP rotation',       website: 'https://scraperapi.com', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'scrapfly',        name: 'Scrapfly',                 category: 'scrape',   endpoint: '/v1/scrape',   description: 'Full-stack scraping with ASP anti-bot protection', website: 'https://scrapfly.io', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'crawl4ai',        name: 'Crawl4AI',                 category: 'scrape',   endpoint: '/v1/scrape',   description: 'Open-source ultra-fast LLM web crawler',          website: 'https://crawl4ai.com', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },

  // Headless Browsers (/v1/browser)
  { id: 'browserbase',     name: 'Browserbase',              category: 'browser',  endpoint: '/v1/browser',  description: 'Cloud Chromium & CDP session infrastructure',     website: 'https://browserbase.com', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'steel',           name: 'Steel Browser',            category: 'browser',  endpoint: '/v1/browser',  description: 'Anti-detect browser cloud for AI agents',          website: 'https://steel.dev', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'browserless',     name: 'Browserless.io',           category: 'browser',  endpoint: '/v1/browser',  description: 'Serverless headless Chrome cloud for Playwright',  website: 'https://browserless.io', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'anchor',          name: 'Anchor Browser',           category: 'browser',  endpoint: '/v1/browser',  description: 'AI-native browser session management platform',    website: 'https://anchorbrowser.io', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },

  // Code Execution Sandboxes (/v1/execute)
  { id: 'daytona',         name: 'Daytona Sandbox',          category: 'execute',  endpoint: '/v1/execute',  description: 'Fast cloud dev environment & execution sandbox',  website: 'https://daytona.io', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'e2b',             name: 'E2B Sandbox',              category: 'execute',  endpoint: '/v1/execute',  description: 'Secure isolated Python & JS code sandbox for AI',  website: 'https://e2b.dev', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },

  // Document Parsing (/v1/document)
  { id: 'firecrawl_parse', name: 'Firecrawl Document Parse', category: 'document', endpoint: '/v1/document', description: 'PDF, DOCX & XLSX parser to structured MD/JSON',     website: 'https://firecrawl.dev', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'llamaparse',      name: 'LlamaParse',               category: 'document', endpoint: '/v1/document', description: 'LlamaIndex PDF & table parser for complex docs', website: 'https://llamaindex.ai', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'unstructured',    name: 'Unstructured.io',          category: 'document', endpoint: '/v1/document', description: 'Ingest unstructured PDFs, HTML & images for LLMs',website: 'https://unstructured.io', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'diffbot',         name: 'Diffbot Document',         category: 'document', endpoint: '/v1/document', description: 'Computer vision document & article extraction',      website: 'https://diffbot.com', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];


const CATEGORY_TABS: Array<{ id: EndpointCategory; label: string; icon: React.ElementType }> = [
  { id: 'all',      label: 'All Tools',         icon: Zap },
  { id: 'search',   label: 'Web Search',        icon: Search },
  { id: 'scrape',   label: 'Scraping & Data',   icon: Globe },
  { id: 'browser',  label: 'Headless Browsers', icon: Globe },
  { id: 'execute',  label: 'Code Sandboxes',    icon: Code2 },
  { id: 'document', label: 'Document Parsing',  icon: FileText },
];

interface ByokKey {
  id: string;
  provider_id: string;
  provider_name: string;
  endpoint: string;
  key_type: 'prioritized' | 'fallback';
  priority_order: number;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  key_hint?: string;
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never used';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export const Keys: React.FC = () => {
  const [keys, setKeys]                 = useState<ByokKey[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<EndpointCategory>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderMeta | null>(null);

  // Add Key Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKeyType, setAddKeyType]     = useState<'prioritized' | 'fallback'>('prioritized');
  const [inputKey, setInputKey]         = useState('');
  const [inputLabel, setInputLabel]     = useState('');
  const [savingKey, setSavingKey]       = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [toasts, setToasts]             = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.listKeys();
      setKeys(data.keys as any);
    } catch (e: any) {
      setError(e.message || 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (id: string, msg: string) => {
    setToasts(p => ({ ...p, [id]: msg }));
    setTimeout(() => setToasts(p => { const n = { ...p }; delete n[id]; return n; }), 3000);
  };

  const handleAddKey = async () => {
    if (!selectedProvider || !inputKey.trim()) return;
    setSavingKey(true);
    try {
      await api.addKey(selectedProvider.id, inputKey.trim(), addKeyType, inputLabel.trim() || undefined);
      showToast(selectedProvider.id, `✅ Added ${addKeyType} key for ${selectedProvider.name}`);
      setInputKey(''); setInputLabel(''); setAddModalOpen(false);
      await load();
    } catch (e: any) {
      showToast(selectedProvider.id, `❌ ${e.message || 'Failed to save key'}`);
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string, providerId: string) => {
    setDeletingId(keyId);
    try {
      await api.deleteKey(keyId);
      showToast(providerId, '🗑️ Key deleted');
      await load();
    } catch (e: any) {
      showToast(providerId, `❌ ${e.message || 'Failed to delete key'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveKey = async (providerId: string, keyType: 'prioritized' | 'fallback', currentKeys: ByokKey[], index: number, direction: 'up' | 'down') => {
    const newKeys = [...currentKeys];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newKeys.length) return;

    // Swap
    const temp = newKeys[index];
    newKeys[index] = newKeys[targetIndex];
    newKeys[targetIndex] = temp;

    const orderedIds = newKeys.map(k => k.id);
    try {
      await api.reorderKeys(providerId, keyType, orderedIds);
      await load();
    } catch (e: any) {
      showToast(providerId, `❌ Reorder failed: ${e.message}`);
    }
  };

  // Group keys by provider_id
  const keysByProvider = useMemo(() => {
    const map = new Map<string, { prioritized: ByokKey[]; fallback: ByokKey[] }>();
    for (const p of ALL_PROVIDERS) {
      map.set(p.id, { prioritized: [], fallback: [] });
    }
    for (const k of keys) {
      const existing = map.get(k.provider_id);
      if (existing) {
        if (k.key_type === 'fallback') existing.fallback.push(k);
        else existing.prioritized.push(k);
      }
    }
    return map;
  }, [keys]);

  const filteredProviders = useMemo(() => {
    let list = ALL_PROVIDERS;
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [categoryFilter, searchQuery]);

  // ───────────────────────────────────────────────────────────────────────────
  // PROVIDER DETAIL VIEW (Matching OpenRouter's Exact BYOK Drawer/Page)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProvider) {
    const providerKeys = keysByProvider.get(selectedProvider.id) || { prioritized: [], fallback: [] };
    const toast = toasts[selectedProvider.id];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 selection:bg-emerald-500 selection:text-slate-950">
        {/* Back Link */}
        <button
          onClick={() => setSelectedProvider(null)}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to BYOK Providers
        </button>

        {/* Provider Title Banner */}
        <div className="flex items-start justify-between p-6 rounded-2xl bg-[#0d1117] border border-slate-800 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${selectedProvider.iconBg}`}>
                {selectedProvider.endpoint}
              </span>
              <h1 className="text-2xl font-extrabold text-white">{selectedProvider.name}</h1>
            </div>
            <p className="text-slate-400 text-sm">{selectedProvider.description}</p>
          </div>
          <a
            href={selectedProvider.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Website
          </a>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
            {toast}
          </div>
        )}

        {/* ── SECTION 1: Prioritized Keys ────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Prioritized Keys
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Attempted in order, before falling back to backup keys.
              </p>
            </div>
            <button
              onClick={() => { setAddKeyType('prioritized'); setAddModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key
            </button>
          </div>

          {providerKeys.prioritized.length === 0 ? (
            <div
              onClick={() => { setAddKeyType('prioritized'); setAddModalOpen(true); }}
              className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 mx-auto mb-1 transition-colors" />
              <p className="text-xs font-mono text-slate-500 group-hover:text-slate-300">
                + Add a prioritized key
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {providerKeys.prioritized.map((k, idx) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-[11px] flex items-center justify-center border border-emerald-500/20">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-emerald-300 font-semibold">{k.key_hint}</p>
                      <p className="text-[10px] text-slate-500">
                        {k.label ? `${k.label} · ` : ''}Last used: {timeAgo(k.last_used_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveKey(selectedProvider.id, 'prioritized', providerKeys.prioritized, idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveKey(selectedProvider.id, 'prioritized', providerKeys.prioritized, idx, 'down')}
                      disabled={idx === providerKeys.prioritized.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(k.id, selectedProvider.id)}
                      disabled={deletingId === k.id}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors ml-1"
                    >
                      {deletingId === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 2: Fallback Keys ──────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Fallback Keys
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tried only after attempting prioritized keys, in order.
              </p>
            </div>
            <button
              onClick={() => { setAddKeyType('fallback'); setAddModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Fallback Key
            </button>
          </div>

          {providerKeys.fallback.length === 0 ? (
            <div
              onClick={() => { setAddKeyType('fallback'); setAddModalOpen(true); }}
              className="border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-amber-400 mx-auto mb-1 transition-colors" />
              <p className="text-xs font-mono text-slate-500 group-hover:text-slate-300">
                + Add a fallback key
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {providerKeys.fallback.map((k, idx) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-[11px] flex items-center justify-center border border-amber-500/20">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-amber-300 font-semibold">{k.key_hint}</p>
                      <p className="text-[10px] text-slate-500">
                        {k.label ? `${k.label} · ` : ''}Last used: {timeAgo(k.last_used_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveKey(selectedProvider.id, 'fallback', providerKeys.fallback, idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveKey(selectedProvider.id, 'fallback', providerKeys.fallback, idx, 'down')}
                      disabled={idx === providerKeys.fallback.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(k.id, selectedProvider.id)}
                      disabled={deletingId === k.id}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors ml-1"
                    >
                      {deletingId === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Key Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950">
            <div className="w-full max-w-md bg-[#0d1117] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Add {addKeyType === 'prioritized' ? 'Prioritized' : 'Fallback'} Key for {selectedProvider.name}
                </h3>
                <button onClick={() => setAddModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    placeholder={`Paste your raw ${selectedProvider.name} API key…`}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Key Label (optional)
                  </label>
                  <input
                    type="text"
                    value={inputLabel}
                    onChange={e => setInputLabel(e.target.value)}
                    placeholder="e.g. Primary Account, Backup Key…"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKey}
                  disabled={savingKey || !inputKey.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MAIN OVERVIEW LIST (OpenRouter-Style Provider Directory)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-emerald-400" />
            Bring Your Own Keys (BYOK)
          </h1>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-slate-400 text-sm">
          Configure API keys for AI agent tool providers. Add prioritized and fallback keys per provider for zero-downtime execution.
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-5 flex items-start gap-4 shadow-xl">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1.5">
          <p className="text-slate-200 font-semibold text-sm">Pure BYOK Tool Gateway</p>
          <p className="leading-relaxed">
            LiteDaemon routes tool requests through your active BYOK keys with zero platform reseller markups.
            Add **Prioritized Keys** for main usage and **Fallback Keys** to automatically handle rate limits (429) or quota errors.
          </p>
          <p className="text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            All keys are AES-256-GCM encrypted. Raw keys are never stored in logs or exposed via the API.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-[#0d1117] border border-slate-800 rounded-xl">
          {CATEGORY_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search providers…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-slate-800 text-white text-xs placeholder-slate-600 focus:border-emerald-500/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" /> Loading BYOK providers…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : (
        /* Provider List Card Grid */
        <div className="rounded-2xl bg-[#0d1117] border border-slate-800 divide-y divide-slate-800/70 overflow-hidden shadow-2xl">
          {filteredProviders.map(p => {
            const keyGroup = keysByProvider.get(p.id) || { prioritized: [], fallback: [] };
            const totalKeys = keyGroup.prioritized.length + keyGroup.fallback.length;
            const isConfigured = totalKeys > 0;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProvider(p)}
                className="flex items-center justify-between p-4 hover:bg-slate-900/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${isConfigured ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-700'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${p.iconBg}`}>
                        {p.endpoint}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      {keyGroup.prioritized.length} Pri · {keyGroup.fallback.length} Fallback
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                      Not configured
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
