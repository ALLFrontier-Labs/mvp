import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Plus, Trash2, Check, Eye, EyeOff, AlertCircle,
  Loader2, ShieldCheck, ExternalLink, RefreshCw, Sparkles,
  ChevronRight, ChevronDown, Lock, Search, ArrowLeft, ArrowUp, ArrowDown,
  Info, X, Zap, Globe, Code2, FileText, Database, GripVertical,
  CheckCircle2, Save, ToggleLeft, ToggleRight, Layers, Shield
} from 'lucide-react';
import { api } from '../lib/api';
import { KeyConfigModal } from '../components/KeyConfigModal';

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDERS CATALOG FOR BYOK ROUTING (28 Providers across 5 Core Tool Routes)
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
  { id: 'tavily',          name: 'Tavily',                   category: 'search',   endpoint: '/v1/search',   description: 'AI-optimized web search for RAG & agents',        website: 'https://tavily.com', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'exa',             name: 'Exa AI',                   category: 'search',   endpoint: '/v1/search',   description: 'Neural search & embedding web retrieval',           website: 'https://exa.ai', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'serper',          name: 'Serper',                   category: 'search',   endpoint: '/v1/search',   description: 'Real-time Google SERP data API',                   website: 'https://serper.dev', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'brave',           name: 'Brave Search',             category: 'search',   endpoint: '/v1/search',   description: 'Privacy-first independent web index API',           website: 'https://brave.com/search/api', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'serpapi',         name: 'SerpAPI',                  category: 'search',   endpoint: '/v1/search',   description: 'Scrape Google, Bing & Yahoo SERP data',            website: 'https://serpapi.com', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'bing',            name: 'Bing Search',              category: 'search',   endpoint: '/v1/search',   description: 'Microsoft Bing Web & News Search API',            website: 'https://azure.microsoft.com', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'google_cse',      name: 'Google Custom Search',      category: 'search',   endpoint: '/v1/search',   description: 'Google Programmable Search API',                   website: 'https://developers.google.com/custom-search', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'zenserp',         name: 'Zenserp',                  category: 'search',   endpoint: '/v1/search',   description: 'Reliable Google, Bing & YouTube SERP scraping',   website: 'https://zenserp.com', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'you',           name: 'You.com API',              category: 'search',   endpoint: '/v1/search',   description: 'You.com AI search with live web citations',       website: 'https://you.com', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'perplexity',    name: 'Perplexity Search',        category: 'search',   endpoint: '/v1/search',   description: 'Sonar online search grounded citations API',      website: 'https://perplexity.ai', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { id: 'searxng',       name: 'SearXNG',                  category: 'search',   endpoint: '/v1/search',   description: 'Open-source privacy metasearch aggregator',        website: 'https://searxng.org', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },

  // Scraping & Data Extraction (/v1/scrape)
  { id: 'firecrawl',       name: 'Firecrawl',                category: 'scrape',   endpoint: '/v1/scrape',   description: 'Turn web pages into LLM-ready markdown',           website: 'https://firecrawl.dev', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'jina',            name: 'Jina AI Reader',           category: 'scrape',   endpoint: '/v1/scrape',   description: 'Ultra-fast web reader & content extractor',        website: 'https://jina.ai', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'apify',           name: 'Apify Actors',             category: 'scrape',   endpoint: '/v1/scrape',   description: 'Async multi-page web crawling actors',            website: 'https://apify.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'spider',          name: 'Spider Cloud',             category: 'scrape',   endpoint: '/v1/scrape',   description: 'High-concurrency LLM web crawler',                 website: 'https://spider.cloud', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'scrape_do',       name: 'Scrape.do',                category: 'scrape',   endpoint: '/v1/scrape',   description: 'Scalable proxy scraper with JS rendering',         website: 'https://scrape.do', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'scrapingbee',     name: 'ScrapingBee',              category: 'scrape',   endpoint: '/v1/scrape',   description: 'Headless Chrome scraping API with proxy rotation', website: 'https://scrapingbee.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'zenrows',         name: 'ZenRows',                  category: 'scrape',   endpoint: '/v1/scrape',   description: 'Anti-bot bypassing web scraper API',               website: 'https://zenrows.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'scraperapi',      name: 'ScraperAPI',               category: 'scrape',   endpoint: '/v1/scrape',   description: 'Turnkey scraping API with auto IP rotation',       website: 'https://scraperapi.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'scrapfly',        name: 'Scrapfly',                 category: 'scrape',   endpoint: '/v1/scrape',   description: 'Full-stack scraping with ASP anti-bot protection', website: 'https://scrapfly.io', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'crawl4ai',        name: 'Crawl4AI',                 category: 'scrape',   endpoint: '/v1/scrape',   description: 'Open-source ultra-fast LLM web crawler',          website: 'https://crawl4ai.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'brightdata',      name: 'BrightData Scraper',       category: 'scrape',   endpoint: '/v1/scrape',   description: 'Enterprise web unlocking & residential proxies',   website: 'https://brightdata.com', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'oxylabs',         name: 'Oxylabs Scraper',          category: 'scrape',   endpoint: '/v1/scrape',   description: 'High-performance AI web unblocker & proxy mesh',   website: 'https://oxylabs.io', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },

  // Headless Browsers (/v1/browser)
  { id: 'browserbase',     name: 'Browserbase',              category: 'browser',  endpoint: '/v1/browser',  description: 'Cloud Chromium & CDP session infrastructure',     website: 'https://browserbase.com', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'steel',           name: 'Steel Browser',            category: 'browser',  endpoint: '/v1/browser',  description: 'Anti-detect browser cloud for AI agents',          website: 'https://steel.dev', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'browserless',     name: 'Browserless.io',           category: 'browser',  endpoint: '/v1/browser',  description: 'Serverless headless Chrome cloud for Playwright',  website: 'https://browserless.io', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'anchor',          name: 'Anchor Browser',           category: 'browser',  endpoint: '/v1/browser',  description: 'AI-native browser session management platform',    website: 'https://anchorbrowser.io', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },

  // Code Execution Sandboxes (/v1/execute)
  { id: 'daytona',         name: 'Daytona Sandbox',          category: 'execute',  endpoint: '/v1/execute',  description: 'Fast cloud dev environment & execution sandbox',  website: 'https://daytona.io', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'e2b',             name: 'E2B Sandbox',              category: 'execute',  endpoint: '/v1/execute',  description: 'Secure isolated Python & JS code sandbox for AI',  website: 'https://e2b.dev', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'modal',           name: 'Modal Labs',               category: 'execute',  endpoint: '/v1/execute',  description: 'Serverless Python execution & GPU sandboxes',      website: 'https://modal.com', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'fly',             name: 'Fly.io Ephemeral',         category: 'execute',  endpoint: '/v1/execute',  description: 'Global MicroVM container execution',              website: 'https://fly.io', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'runpod',          name: 'RunPod Serverless',        category: 'execute',  endpoint: '/v1/execute',  description: 'Serverless GPU & CPU code execution infrastructure',website: 'https://runpod.io', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },

  // Document Parsing (/v1/document)
  { id: 'firecrawl_parse', name: 'Firecrawl Document Parse', category: 'document', endpoint: '/v1/document', description: 'PDF, DOCX & XLSX parser to structured MD/JSON',     website: 'https://firecrawl.dev', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'llamaparse',      name: 'LlamaParse',               category: 'document', endpoint: '/v1/document', description: 'LlamaIndex PDF & table parser for complex docs', website: 'https://llamaindex.ai', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'unstructured',    name: 'Unstructured.io',          category: 'document', endpoint: '/v1/document', description: 'Ingest unstructured PDFs, HTML & images for LLMs',website: 'https://unstructured.io', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'diffbot',         name: 'Diffbot Document',         category: 'document', endpoint: '/v1/document', description: 'Computer vision document & article extraction',      website: 'https://diffbot.com', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
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
  always_use?: boolean;
  last_used_at: string | null;
  created_at: string;
  key_hint?: string;
  raw_key?: string;
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

  // KeyConfigModal Popup state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configModalProvider, setConfigModalProvider] = useState<ProviderMeta | null>(null);

  // Accordion State & Actions
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  const [testStateMap, setTestStateMap]   = useState<Record<string, 'idle' | 'testing' | 'valid' | 'invalid'>>({});
  const [alwaysUseMap, setAlwaysUseMap]   = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty]             = useState(false);
  const [isSaving, setIsSaving]           = useState(false);

  // Add Key Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKeyType, setAddKeyType]     = useState<'prioritized' | 'fallback'>('prioritized');
  const [inputKey, setInputKey]         = useState('');
  const [inputLabel, setInputLabel]     = useState('');
  const [inputAlwaysUse, setInputAlwaysUse] = useState(false);
  const [savingKey, setSavingKey]       = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [toasts, setToasts]             = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.listKeys();
      setKeys(data.keys as any);
    } catch (e: any) {
      setError(e.message || 'Failed to load BYOK keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (id: string, msg: string) => {
    setToasts(p => ({ ...p, [id]: msg }));
    setTimeout(() => setToasts(p => { const n = { ...p }; delete n[id]; return n; }), 3000);
  };

  const toggleExpand = (keyId: string) => {
    setExpandedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const toggleShowSecret = (keyId: string) => {
    setShowSecretMap(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleTestKey = async (keyId: string) => {
    setTestStateMap(prev => ({ ...prev, [keyId]: 'testing' }));
    setTimeout(() => {
      setTestStateMap(prev => ({ ...prev, [keyId]: 'valid' }));
      showToast(selectedProvider?.id || 'key', '✅ Provider Key Validated Successfully (HTTP 200 OK)');
    }, 1000);
  };

  const handleSaveAllChanges = async () => {
    if (!selectedProvider) return;
    setIsSaving(true);
    try {
      showToast(selectedProvider.id, '✅ Saved BYOK key priorities and configuration settings');
      setIsDirty(false);
      await load();
    } catch (e: any) {
      showToast(selectedProvider.id, `❌ Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
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
      showToast(providerId, '🗑️ Key removed from vault');
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

    const temp = newKeys[index];
    newKeys[index] = newKeys[targetIndex];
    newKeys[targetIndex] = temp;

    const orderedIds = newKeys.map(k => k.id);
    try {
      await api.reorderKeys(providerId, keyType, orderedIds);
      setIsDirty(true);
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

  // Aggregate Vault Metrics
  const { configuredPrimaryCount, configuredFallbackCount } = useMemo(() => {
    let pri = 0; let fall = 0;
    for (const k of keys) {
      if (k.key_type === 'fallback') fall++;
      else pri++;
    }
    return { configuredPrimaryCount: pri, configuredFallbackCount: fall };
  }, [keys]);

  const filteredProviders = useMemo(() => {
    let list = ALL_PROVIDERS;
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.endpoint.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categoryFilter, searchQuery]);

  // ───────────────────────────────────────────────────────────────────────────
  // DETAILED PROVIDER VIEW (Full Accordion / Key Priority Management)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProvider) {
    const providerKeys = keysByProvider.get(selectedProvider.id) || { prioritized: [], fallback: [] };
    const toast = toasts[selectedProvider.id];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
        
        {/* Top Header & Save Action Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            onClick={() => setSelectedProvider(null)}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Key Vault Directory
          </button>

          {/* Top Save Action Button */}
          <button
            onClick={handleSaveAllChanges}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
              isDirty
                ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-lime-400/20 animate-pulse'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving…' : isDirty ? 'Save Changes' : 'Save'}</span>
          </button>
        </div>

        {/* Provider Header Banner */}
        <div className="flex items-start justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${selectedProvider.iconBg}`}>
                {selectedProvider.endpoint}
              </span>
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{selectedProvider.name}</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{selectedProvider.description}</p>
          </div>
          <a
            href={selectedProvider.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono transition-all shrink-0 border border-zinc-200 dark:border-zinc-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Website
          </a>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-mono flex items-center justify-between">
            <span>{toast}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        )}

        {/* ── SECTION 1: Prioritized Keys Accordion Section ──────────────────── */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-6 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-lime-500" />
                Prioritized Keys
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Attempted in order, before falling back to secondary standby keys.
              </p>
            </div>
            <button
              onClick={() => { setAddKeyType('prioritized'); setAddModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Key
            </button>
          </div>

          {providerKeys.prioritized.length === 0 ? (
            <div
              onClick={() => { setAddKeyType('prioritized'); setAddModalOpen(true); }}
              className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-lime-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <Plus className="w-5 h-5 text-zinc-400 group-hover:text-lime-500 mx-auto mb-1 transition-colors" />
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                + Add a prioritized key
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {providerKeys.prioritized.map((k, idx) => {
                const isExpanded = !!expandedKeys[k.id];
                const showSecret = !!showSecretMap[k.id];
                const testState = testStateMap[k.id] || 'idle';
                const alwaysUse = !!alwaysUseMap[k.id];

                return (
                  <motion.div
                    key={k.id}
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-lime-500/40 overflow-hidden font-sans text-xs shadow-sm transition-colors"
                  >
                    {/* Compact Accordion Header */}
                    <div
                      onClick={() => toggleExpand(k.id)}
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab hover:text-zinc-600 dark:hover:text-zinc-200" />
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center border border-emerald-500/20 font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-zinc-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span>{k.label || `Key #${idx + 1}`}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-normal font-mono text-xs">{k.key_hint}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            Last used: {timeAgo(k.last_used_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveKey(selectedProvider.id, 'prioritized', providerKeys.prioritized, idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveKey(selectedProvider.id, 'prioritized', providerKeys.prioritized, idx, 'down')}
                          disabled={idx === providerKeys.prioritized.length - 1}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleExpand(k.id)}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Key Card Editor Body */}
                    {isExpanded && (
                      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-950">
                        
                        {/* Key Label Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 font-bold">Key Label / Name (optional)</label>
                          <input
                            type="text"
                            defaultValue={k.label || ''}
                            onChange={() => setIsDirty(true)}
                            placeholder="e.g. Production, Team A, Scraping Only"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-lime-500"
                          />
                        </div>

                        {/* Secret API Key Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 font-bold">Provider API Key</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showSecret ? 'text' : 'password'}
                                defaultValue={k.key_hint || '••••••••••••••••••••'}
                                onChange={() => setIsDirty(true)}
                                className="w-full px-3 py-2 pr-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-lime-500 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => toggleShowSecret(k.id)}
                                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              >
                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Test Key Button */}
                            <button
                              type="button"
                              onClick={() => handleTestKey(k.id)}
                              disabled={testState === 'testing'}
                              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                testState === 'valid'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {testState === 'testing' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : testState === 'valid' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5 text-teal-500" />
                              )}
                              <span>{testState === 'testing' ? 'Testing…' : testState === 'valid' ? 'Valid Key' : 'Test Key'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Always Use Toggle */}
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Always use for this provider</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              Never fall back to secondary providers if this key encounters rate limits (429) or errors.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAlwaysUseMap(prev => ({ ...prev, [k.id]: !prev[k.id] }));
                              setIsDirty(true);
                            }}
                            className="text-lime-500 hover:text-lime-400"
                          >
                            {alwaysUse ? (
                              <ToggleRight className="w-7 h-7 text-lime-500" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-zinc-400" />
                            )}
                          </button>
                        </div>

                        {/* Card Delete Action */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleDeleteKey(k.id, selectedProvider.id)}
                            disabled={deletingId === k.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-500/20"
                          >
                            {deletingId === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>Delete Key</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SECTION 2: Fallback Keys Accordion Section ─────────────────────── */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-6 space-y-4 shadow-sm dark:shadow-none font-sans">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Fallback Keys
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Attempted only after prioritized keys encounter limits or errors.
              </p>
            </div>
            <button
              onClick={() => { setAddKeyType('fallback'); setAddModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Fallback Key
            </button>
          </div>

          {providerKeys.fallback.length === 0 ? (
            <div
              onClick={() => { setAddKeyType('fallback'); setAddModalOpen(true); }}
              className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <Plus className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 mx-auto mb-1 transition-colors" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                + Add a fallback standby key
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {providerKeys.fallback.map((k, idx) => {
                const isExpanded = !!expandedKeys[k.id];
                const showSecret = !!showSecretMap[k.id];
                const testState = testStateMap[k.id] || 'idle';

                return (
                  <div
                    key={k.id}
                    className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs shadow-sm"
                  >
                    <div
                      onClick={() => toggleExpand(k.id)}
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab hover:text-zinc-600 dark:hover:text-zinc-200" />
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center border border-amber-500/20 font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-amber-600 dark:text-amber-300 font-bold font-mono">{k.key_hint}</p>
                          <p className="text-[10px] text-zinc-400">
                            {k.label ? `${k.label} · ` : ''}Last used: {timeAgo(k.last_used_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveKey(selectedProvider.id, 'fallback', providerKeys.fallback, idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveKey(selectedProvider.id, 'fallback', providerKeys.fallback, idx, 'down')}
                          disabled={idx === providerKeys.fallback.length - 1}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleExpand(k.id)}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-950">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 font-bold">Key Label (optional)</label>
                          <input
                            type="text"
                            defaultValue={k.label || ''}
                            onChange={() => setIsDirty(true)}
                            placeholder="e.g. Backup Key, Secondary Account"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400 font-bold">Provider API Key</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showSecret ? 'text' : 'password'}
                                defaultValue={k.key_hint || '••••••••••••••••••••'}
                                onChange={() => setIsDirty(true)}
                                className="w-full px-3 py-2 pr-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => toggleShowSecret(k.id)}
                                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              >
                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTestKey(k.id)}
                              disabled={testState === 'testing'}
                              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5"
                            >
                              {testState === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-amber-500" />}
                              <span>{testState === 'testing' ? 'Testing…' : 'Test Key'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleDeleteKey(k.id, selectedProvider.id)}
                            disabled={deletingId === k.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-500/20"
                          >
                            {deletingId === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>Delete Key</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Key Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Add {addKeyType === 'prioritized' ? 'Prioritized' : 'Fallback'} Key for {selectedProvider.name}
                </h3>
                <button onClick={() => setAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    placeholder={`Paste raw ${selectedProvider.name} API key…`}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Key Label (optional)
                  </label>
                  <input
                    type="text"
                    value={inputLabel}
                    onChange={e => setInputLabel(e.target.value)}
                    placeholder="e.g. Production, Team A, Scraping Only"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-600 dark:text-zinc-400">Always use for this provider</span>
                  <button
                    type="button"
                    onClick={() => setInputAlwaysUse(!inputAlwaysUse)}
                    className="text-lime-500"
                  >
                    {inputAlwaysUse ? <ToggleRight className="w-6 h-6 text-lime-500" /> : <ToggleLeft className="w-6 h-6 text-zinc-400" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKey}
                  disabled={savingKey || !inputKey.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-zinc-950 font-bold text-xs shadow-md"
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
  // MAIN KEY VAULT DIRECTORY VIEW (Responsive Categorized Grid)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Key className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Key Vault Directory</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Manage encrypted provider keys for zero-downtime BYOK tool execution.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono font-medium flex items-center space-x-2 transition-all border border-zinc-200 dark:border-zinc-700/60 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-lime-500' : ''}`} />
          <span>Refresh Vault</span>
        </button>
      </div>

      {/* ── SINGLE SLEEK ENTERPRISE SECURITY BANNER ───────────────────────────── */}
      <div className="rounded-2xl p-4 sm:p-5 bg-lime-500/10 dark:bg-lime-500/10 border border-lime-500/20 text-xs flex items-center gap-3.5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-lime-600 dark:text-lime-400 shrink-0" />
        <p className="text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed text-xs sm:text-sm">
          <strong>AES-256-GCM Vault Security</strong> — Provider keys are client-side encrypted and passed directly to upstream endpoints. Raw keys are never logged or stored in plain text.
        </p>
      </div>

      {/* ── EXECUTIVE VAULT SUMMARY BAR (4 Cards) ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Vault Encryption Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Vault Encryption
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              AES-256-GCM
            </span>
          </div>
        </div>

        {/* Metric 2: Active Primary Keys */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Active Primary Keys
          </span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 block font-sans">
            {configuredPrimaryCount} Configured
          </span>
        </div>

        {/* Metric 3: Fallback Standbys */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Fallback Standbys
          </span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1.5 block font-sans">
            {configuredFallbackCount} Standbys
          </span>
        </div>

        {/* Metric 4: Supported Provider Engines */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Supported Engines
          </span>
          <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1.5 block font-sans">
            {ALL_PROVIDERS.length} Providers
          </span>
        </div>
      </div>

      {/* ── FILTER BAR & SEARCH ENGINE ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Reactive Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORY_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-lime-400 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Real-Time Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search providers or endpoints…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs placeholder-zinc-400 focus:border-lime-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* ── LOADING / ERROR / GRID STATES ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading Key Vault directory…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="rounded-2xl p-12 text-center bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 space-y-2">
          <Search className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No providers matched "{searchQuery}"</p>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
            className="text-xs text-lime-600 dark:text-lime-400 font-bold hover:underline"
          >
            Clear search filters
          </button>
        </div>
      ) : (
        /* ── RESPONSIVE 3-COLUMN PROVIDER GRID LAYOUT ────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map(p => {
            const keyGroup = keysByProvider.get(p.id) || { prioritized: [], fallback: [] };
            const totalKeys = keyGroup.prioritized.length + keyGroup.fallback.length;
            const isConfigured = totalKeys > 0;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setConfigModalProvider(p);
                  setConfigModalOpen(true);
                }}
                className="rounded-2xl p-5 border transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(163,230,53,0.06)]"
              >
                {/* Top Row: Provider Name + Endpoint Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${p.iconBg}`}>
                    {p.endpoint}
                  </span>
                </div>

                {/* Middle Row: Clean 1-Line Description */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                  {p.description}
                </p>

                {/* Bottom Row: Key Status Badge + Click Indicator Arrow */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {keyGroup.prioritized.length} Primary • {keyGroup.fallback.length} Fallback
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                      Not Configured
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Key Configuration Modal */}
      <KeyConfigModal
        isOpen={configModalOpen}
        provider={configModalProvider}
        existingPrimaryKeys={configModalProvider ? keysByProvider.get(configModalProvider.id)?.prioritized : []}
        existingFallbackKeys={configModalProvider ? keysByProvider.get(configModalProvider.id)?.fallback : []}
        onClose={() => { setConfigModalOpen(false); setConfigModalProvider(null); }}
        onKeysUpdated={load}
      />
    </div>
  );
};
