import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Layers, Copy, Check, ExternalLink, ShieldCheck,
  RefreshCw, Loader2, Zap, Terminal, Code2, ArrowUpDown, ChevronRight,
  X, CheckCircle2, AlertCircle, Cpu, Globe, Eye, Sparkles, Key, Plus,
  Wrench, MessageSquare, Send, Server, Link2
} from 'lucide-react';
import { api, getStoredApiKey } from '../lib/api';

// ── Rich Provider Metadata for All 36 Production Adapters ───────────────────
interface RichMeta {
  description: string;
  website: string;
  latency: string;
  capabilities: string[];
  sampleParams: Record<string, any>;
  iconBg: string;
}

const PROVIDER_META: Record<string, RichMeta> = {
  // ── Web Scraping (/v1/scrape) ─────────────────────────────────────────────
  firecrawl: {
    description: 'Turn any web page into LLM-ready clean markdown with structured metadata extraction.',
    website: 'https://firecrawl.dev',
    latency: '~1.2s',
    capabilities: ['Markdown Output', 'Metadata Extraction', 'Clean Text', 'LLM Optimized'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
  },
  jina: {
    description: 'Blazing-fast web reader & markdown extractor optimized for minimal token overhead.',
    website: 'https://jina.ai',
    latency: '~450ms',
    capabilities: ['Ultra Fast', 'Reader API', 'Token Optimized', 'Clean Markdown'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
  apify: {
    description: 'Async actor execution for large scale, multi-page crawling and dataset exports.',
    website: 'https://apify.com',
    latency: '~3.5s',
    capabilities: ['Async Actor', 'Multi-Page Crawl', 'Dataset Export', 'Headless Scraper'],
    sampleParams: { actor_id: 'apify/website-content-crawler', url: 'https://example.com' },
    iconBg: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
  },
  spider: {
    description: 'High-concurrency cloud crawler & scraper with automatic bot detection bypass.',
    website: 'https://spider.cloud',
    latency: '~650ms',
    capabilities: ['High Concurrency', 'Cloud Crawler', 'Anti-Bot Bypass', 'Fast JSON/MD'],
    sampleParams: { url: 'https://example.com', limit: 1 },
    iconBg: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
  },
  scrape_do: {
    description: 'Scalable proxy-backed web scraper with automatic JavaScript rendering and geo-targeting.',
    website: 'https://scrape.do',
    latency: '~800ms',
    capabilities: ['JS Rendering', 'Geo Proxies', 'Bypass Cloudflare', 'Clean HTML'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-emerald-600/20 to-lime-500/20 text-emerald-400 border-emerald-500/30',
  },
  scrapingbee: {
    description: 'Headless Chrome scraping API with proxy rotation and custom JS execution scripts.',
    website: 'https://scrapingbee.com',
    latency: '~1.1s',
    capabilities: ['Headless Chrome', 'Proxy Rotation', 'JS Snippets', 'Screenshot Support'],
    sampleParams: { url: 'https://example.com', render_js: true },
    iconBg: 'from-yellow-600/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
  },
  zenrows: {
    description: 'Anti-bot bypassing web scraper API designed to handle protected websites effortlessly.',
    website: 'https://zenrows.com',
    latency: '~900ms',
    capabilities: ['Anti-Bot Bypass', 'Residential Proxies', 'CAPTCHA Solver', 'DOM Parsing'],
    sampleParams: { url: 'https://example.com', js_render: true },
    iconBg: 'from-indigo-600/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
  },
  scraperapi: {
    description: 'Turn-key web scraping API handling IP rotation, CAPTCHAs, and headless browsers automatically.',
    website: 'https://scraperapi.com',
    latency: '~1.0s',
    capabilities: ['IP Rotation', 'CAPTCHA Handling', 'Auto Retry', 'HTML Scraper'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-sky-600/20 to-blue-500/20 text-sky-400 border-sky-500/30',
  },
  scrapfly: {
    description: 'Full-stack web scraping platform with Anti-Scraping protection bypass and headless Chrome.',
    website: 'https://scrapfly.io',
    latency: '~850ms',
    capabilities: ['Anti-Scraping Bypass', 'Headless Chrome', 'SSL Fingerprinting', 'Webhook Alerts'],
    sampleParams: { url: 'https://example.com', asp: true },
    iconBg: 'from-rose-600/20 to-pink-500/20 text-rose-400 border-rose-500/30',
  },
  crawl4ai: {
    description: 'Open-source, ultra-fast LLM web crawler designed for RAG pipelines & agentic extraction.',
    website: 'https://crawl4ai.com',
    latency: '~380ms',
    capabilities: ['Open Source', 'LLM Tailored', 'Chunking Engine', 'Ultra Low Latency'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-teal-600/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
  },
  brightdata: {
    description: 'Enterprise web unlocking, residential proxy rotation, and structured web data extraction.',
    website: 'https://brightdata.com',
    latency: '~1.1s',
    capabilities: ['Enterprise Proxies', 'Web Unlocker', 'Residential IPs', 'SERP & Web'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-blue-700/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
  },
  oxylabs: {
    description: 'High-performance web scraping API with next-gen AI web unblocker and proxy mesh.',
    website: 'https://oxylabs.io',
    latency: '~1.0s',
    capabilities: ['AI Web Unblocker', 'Proxy Mesh', 'Geo Geotargeting', 'High Scalability'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-violet-600/20 to-purple-600/20 text-violet-400 border-violet-500/30',
  },

  // ── Web Search (/v1/search) ───────────────────────────────────────────────
  tavily: {
    description: 'AI-optimized web search engine purpose-built for autonomous LLM agents and RAG pipelines.',
    website: 'https://tavily.com',
    latency: '~550ms',
    capabilities: ['AI Agent Search', 'RAG Optimized', 'Direct Answers', 'Domain Filter'],
    sampleParams: { query: 'latest breakthroughs in AI agents 2026' },
    iconBg: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
  },
  serper: {
    description: 'Real-time Google SERP search results API returning structured knowledge graphs and news.',
    website: 'https://serper.dev',
    latency: '~350ms',
    capabilities: ['Google SERP', 'Real-time News', 'Knowledge Graph', 'Fast JSON'],
    sampleParams: { query: 'best web scraping tools 2026' },
    iconBg: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
  },
  exa: {
    description: 'Neural web search by vector embeddings and semantic similarity across the entire web.',
    website: 'https://exa.ai',
    latency: '~700ms',
    capabilities: ['Neural Embeddings', 'Semantic Similarity', 'Company Data', 'Autoprompt'],
    sampleParams: { query: 'open source AI gateway projects' },
    iconBg: 'from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30',
  },
  brave: {
    description: 'Privacy-first independent web index API for real-time web search results.',
    website: 'https://brave.com/search/api',
    latency: '~400ms',
    capabilities: ['Web Index', 'Independent Search', 'Privacy First', 'Fast Results'],
    sampleParams: { query: 'privacy AI agents' },
    iconBg: 'from-teal-500/20 to-sky-500/20 text-teal-400 border-teal-500/30',
  },
  serpapi: {
    description: 'Scrape Google, Bing, DuckDuckGo, Baidu, and Yahoo search engines with real-time SERP data.',
    website: 'https://serpapi.com',
    latency: '~900ms',
    capabilities: ['Multi Search Engine', 'SERP Scraper', 'Location Geotarget', 'Raw JSON'],
    sampleParams: { query: 'AI startups 2026' },
    iconBg: 'from-green-600/20 to-emerald-500/20 text-green-400 border-green-500/30',
  },
  bing: {
    description: 'Microsoft Bing Search API for global web, news, image, and video search results.',
    website: 'https://azure.microsoft.com',
    latency: '~450ms',
    capabilities: ['Microsoft Index', 'News Search', 'Web Results', 'Azure Infra'],
    sampleParams: { query: 'enterprise AI development' },
    iconBg: 'from-blue-600/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
  },
  google_cse: {
    description: 'Google Custom Search Engine API for programmable web search across targeted domains.',
    website: 'https://developers.google.com/custom-search',
    latency: '~500ms',
    capabilities: ['Google Engine', 'Custom Search', 'Domain Pinning', 'Official API'],
    sampleParams: { query: 'developer tools' },
    iconBg: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
  },
  zenserp: {
    description: 'Reliable SERP API offering Google, Bing, DuckDuckGo & YouTube search scraping.',
    website: 'https://zenserp.com',
    latency: '~600ms',
    capabilities: ['Google & Bing', 'YouTube Search', 'Geo Targeting', 'SERP Data'],
    sampleParams: { query: 'AI agent tools' },
    iconBg: 'from-violet-600/20 to-purple-500/20 text-violet-400 border-violet-500/30',
  },
  you: {
    description: 'You.com AI search API providing cited live web snippets and conversational LLM search snippets.',
    website: 'https://you.com',
    latency: '~500ms',
    capabilities: ['Live Citations', 'Conversational Search', 'LLM Tailored', 'News & Web'],
    sampleParams: { query: 'autonomous AI agent frameworks' },
    iconBg: 'from-cyan-600/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
  },
  perplexity: {
    description: 'Perplexity Sonar online search API offering grounded web search citations with reasoning summaries.',
    website: 'https://perplexity.ai',
    latency: '~800ms',
    capabilities: ['Sonar Grounding', 'Web Search Citations', 'Reasoning Summaries', 'Real-time Web'],
    sampleParams: { query: 'latest AI agent benchmarks 2026' },
    iconBg: 'from-teal-600/20 to-cyan-500/20 text-teal-400 border-teal-500/30',
  },
  searxng: {
    description: 'Privacy-respecting open-source metasearch engine aggregator combining 70+ search engines.',
    website: 'https://searxng.org',
    latency: '~400ms',
    capabilities: ['Open Source Metasearch', 'No Tracking', '70+ Aggregated Engines', 'Self Hostable'],
    sampleParams: { query: 'privacy open source software' },
    iconBg: 'from-slate-600/20 to-zinc-500/20 text-slate-300 border-slate-500/30',
  },

  // ── Headless Browsers (/v1/browser) ───────────────────────────────────────
  browserbase: {
    description: 'Cloud Chromium browser infrastructure offering CDP WebSocket connections and live debugging.',
    website: 'https://browserbase.com',
    latency: '~1.0s',
    capabilities: ['Cloud Chromium', 'CDP WebSocket', 'Live Debug URL', 'Session Replay'],
    sampleParams: { project_id: '1fa26dbc-4084-4cbf-8ba6-0ed47dc7a3ee' },
    iconBg: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
  },
  steel: {
    description: 'Anti-detect cloud browser infrastructure with integrated captcha solving and stealth proxies.',
    website: 'https://steel.dev',
    latency: '~1.2s',
    capabilities: ['Anti-Detect Fingerprint', 'Captcha Solver', 'Proxy Support', 'Playwright/Puppeteer'],
    sampleParams: { use_proxy: false, solve_captcha: true },
    iconBg: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
  },
  browserless: {
    description: 'Serverless headless Chrome cloud for running Puppeteer and Playwright scripts at scale.',
    website: 'https://browserless.io',
    latency: '~950ms',
    capabilities: ['Serverless Chrome', 'Puppeteer & Playwright', 'PDF & Screenshot', 'Cluster Mode'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-cyan-600/20 to-teal-500/20 text-cyan-400 border-cyan-500/30',
  },
  anchor: {
    description: 'AI-native cloud browser platform designed for autonomous agent session management.',
    website: 'https://anchorbrowser.io',
    latency: '~1.1s',
    capabilities: ['Agentic Browser', 'Session Persist', 'Stealth Mode', 'CDP Connect'],
    sampleParams: { url: 'https://example.com' },
    iconBg: 'from-purple-600/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30',
  },

  // ── Document Parsing (/v1/document) ──────────────────────────────────────
  llamaparse: {
    description: 'Advanced document parsing engine for complex PDF tables, forms, and multi-page documents.',
    website: 'https://llamaindex.ai',
    latency: '~1.2s',
    capabilities: ['LlamaIndex Parser', 'Table Extraction', 'PDF & PPTX Support', 'Structured Data'],
    sampleParams: { file_url: 'https://example.com/sample.pdf', format: 'markdown' },
    iconBg: 'from-blue-600/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
  },
  unstructured: {
    description: 'Ingest and process unstructured PDFs, HTML, DOCX, and images for LLM pipelines.',
    website: 'https://unstructured.io',
    latency: '~1.4s',
    capabilities: ['Multi-Format Ingest', 'OCR Extraction', 'Table Recognition', 'Chunking API'],
    sampleParams: { file_url: 'https://example.com/sample.pdf' },
    iconBg: 'from-amber-600/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
  },
  firecrawl_parse: {
    description: 'Parse local or hosted PDF, DOCX, and XLSX files directly into LLM-ready markdown or structured JSON.',
    website: 'https://firecrawl.dev',
    latency: '~1.5s',
    capabilities: ['PDF to Markdown', 'DOCX / XLSX Parsing', 'JSON Schema Extraction', 'OCR Support'],
    sampleParams: { file_url: 'https://example.com/sample.pdf', format: 'markdown' },
    iconBg: 'from-orange-600/20 to-red-500/20 text-orange-400 border-orange-500/30',
  },
  diffbot: {
    description: 'AI computer vision document and web article extraction into clean JSON knowledge graphs.',
    website: 'https://diffbot.com',
    latency: '~1.3s',
    capabilities: ['Computer Vision', 'Knowledge Graph', 'Automatic Schema', 'Entity Extraction'],
    sampleParams: { url: 'https://example.com/article' },
    iconBg: 'from-emerald-600/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },

  // ── Execution Sandboxes (/v1/execute) ─────────────────────────────────────
  e2b: {
    description: 'Secure, isolated cloud code execution sandbox for running untrusted LLM-generated code.',
    website: 'https://e2b.dev',
    latency: '~800ms',
    capabilities: ['Python Sandbox', 'Jupyter Kernel', 'Filesystem Access', 'Isolated Container'],
    sampleParams: { code: 'import math\nprint(f"Pi calculated: {math.pi}")' },
    iconBg: 'from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30',
  },
  daytona: {
    description: 'Fast, secure cloud code execution environment for AI agents and automated workflows.',
    website: 'https://daytona.io',
    latency: '~650ms',
    capabilities: ['Python / JS Execution', 'Isolated Container', 'Fast Startup', 'Workspace API'],
    sampleParams: { code: 'print("Hello from Daytona Sandbox via LiteDaemon!")' },
    iconBg: 'from-emerald-600/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
  modal: {
    description: 'Serverless Python cloud infrastructure for running heavy AI workloads, functions, and sandboxes.',
    website: 'https://modal.com',
    latency: '~900ms',
    capabilities: ['Serverless Python', 'GPU / CPU Scaling', 'Custom Containers', 'Async Tasks'],
    sampleParams: { code: 'def main(): return "Modal Execution Completed"' },
    iconBg: 'from-sky-600/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
  },
  fly: {
    description: 'Global ephemeral MicroVM execution containers deployed instantly close to end users.',
    website: 'https://fly.io',
    latency: '~750ms',
    capabilities: ['MicroVM Isolation', 'Global Deployment', 'Low Latency Container', 'Docker Native'],
    sampleParams: { code: 'console.log("Fly MicroVM Started")' },
    iconBg: 'from-violet-600/20 to-indigo-500/20 text-violet-400 border-violet-500/30',
  },
  runpod: {
    description: 'Serverless GPU & CPU code execution infrastructure for high-throughput AI agent workloads.',
    website: 'https://runpod.io',
    latency: '~1.2s',
    capabilities: ['Serverless GPU', 'High Throughput', 'PyTorch / CUDA Support', 'Async Workers'],
    sampleParams: { code: 'print("RunPod Serverless Task Dispatched")' },
    iconBg: 'from-purple-600/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30',
  },
};

const ENDPOINT_BADGE: Record<string, { label: string; text: string; bg: string; border: string }> = {
  scrape:   { label: '/v1/scrape',   text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  search:   { label: '/v1/search',   text: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  browser:  { label: '/v1/browser',  text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  execute:  { label: '/v1/execute',  text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  document: { label: '/v1/document', text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
};

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
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalTab, setCustomModalTab]     = useState<'request' | 'proxy'>('request');
  const [customFormState, setCustomFormState]   = useState({
    name: '',
    url: '',
    authHeader: 'Authorization',
    useCase: '',
  });
  const [customSubmitted, setCustomSubmitted] = useState<string | null>(null);

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
      setCustomSubmitted('Request submitted successfully! Our engineering team will review and prioritize this adapter.');
    } else {
      setCustomSubmitted(`Custom REST Proxy for "${customFormState.name || 'Custom Adapter'}" registered successfully.`);
    }
    setTimeout(() => {
      setCustomSubmitted(null);
      setIsCustomModalOpen(false);
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
              Unified Tool Router
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
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 35+ providers by name, capability (e.g. Markdown, SERP, CDP), or endpoint..."
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
              onClick={() => { setIsCustomModalOpen(true); setCustomSubmitted(null); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Request Adapter / Add Custom Proxy
            </button>
          </div>
        </div>
      )}

      {/* ── Custom Request & Proxy Modal (Dialog) ───────────────────────────── */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl font-mono text-xs">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Custom Adapter &amp; REST Proxy</h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
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
                Request New Adapter
              </button>
              <button
                onClick={() => setCustomModalTab('proxy')}
                className={`flex-1 py-2 text-center rounded-lg transition-all font-semibold ${
                  customModalTab === 'proxy'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Configure Custom REST Proxy
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
                      <label className="text-slate-300 font-semibold">Provider / Tool Name</label>
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
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Agent Workflow Use Case (Optional)</label>
                      <textarea
                        rows={2}
                        value={customFormState.useCase}
                        onChange={e => setCustomFormState({ ...customFormState, useCase: e.target.value })}
                        placeholder="Describe how your AI agent will consume this endpoint..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Custom Adapter Name</label>
                      <input
                        type="text"
                        required
                        value={customFormState.name}
                        onChange={e => setCustomFormState({ ...customFormState, name: e.target.value })}
                        placeholder="Internal Scraping Proxy"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-semibold">Base Endpoint URL</label>
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
                    onClick={() => setIsCustomModalOpen(false)}
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
