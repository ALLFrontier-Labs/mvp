import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Zap, Clock, DollarSign, Search, X, Activity, CheckCircle2,
  Trophy, Medal, Crown, ArrowUpRight, ArrowDownRight, Minus, RefreshCw,
  Sliders, ShieldCheck, Layers, ExternalLink
} from 'lucide-react';
import { ProviderPerformanceDrawer } from '../components/ProviderPerformanceDrawer';
import { KeyConfigModal } from '../components/KeyConfigModal';
import { PROVIDER_META } from '../data/providers';

interface ToolBenchmark {
  rank: number;
  trend: 'up' | 'down' | 'flat';
  trendValue: number;
  providerId: string;
  name: string;
  provider: string;
  category: 'Search' | 'Scraping' | 'Code' | 'Browser' | 'Document';
  score: number;
  latency: string;
  latencyMs: number;
  p50Latency: string;
  p90Latency: string;
  p99Latency: string;
  uptime: string;
  uptimeVal: number;
  cost: string;
  costVal: number;
  failoverHealth: string;
  endpoint: string;
  description: string;
}

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
};

const ProviderBrandIcon: React.FC<{ providerId: string; name: string }> = ({ providerId, name }) => {
  const brand = BRAND_ACCENT_STYLES[providerId] || {
    bg: 'bg-lime-500/10 dark:bg-lime-500/20',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-500/30',
    iconLetter: name.slice(0, 2).toUpperCase()
  };

  return (
    <div className={`w-9 h-9 rounded-xl ${brand.bg} border ${brand.border} flex items-center justify-center font-mono font-extrabold text-xs ${brand.text} shadow-sm shrink-0`}>
      {brand.iconLetter}
    </div>
  );
};

const MOCK_RANKINGS: ToolBenchmark[] = [
  { rank: 1, trend: 'up', trendValue: 2, providerId: 'tavily', name: 'Tavily Search', provider: 'Tavily', category: 'Search', score: 98.4, latency: '142ms', latencyMs: 142, p50Latency: '120ms', p90Latency: '185ms', p99Latency: '310ms', uptime: '99.99%', uptimeVal: 99.99, cost: '$0.001 / call', costVal: 0.001, failoverHealth: '100%', endpoint: '/v1/search', description: 'Real-time AI optimized search API built specifically for LLM agents.' },
  { rank: 2, trend: 'flat', trendValue: 0, providerId: 'exa', name: 'Exa Neural Search', provider: 'Exa', category: 'Search', score: 96.1, latency: '198ms', latencyMs: 198, p50Latency: '175ms', p90Latency: '240ms', p99Latency: '420ms', uptime: '99.95%', uptimeVal: 99.95, cost: '$0.002 / call', costVal: 0.002, failoverHealth: '99.8%', endpoint: '/v1/search', description: 'Embeddings-based semantic neural web search for high-density document retrieval.' },
  { rank: 3, trend: 'up', trendValue: 1, providerId: 'firecrawl', name: 'Firecrawl Scrape Engine', provider: 'Firecrawl', category: 'Scraping', score: 95.7, latency: '320ms', latencyMs: 320, p50Latency: '280ms', p90Latency: '450ms', p99Latency: '890ms', uptime: '99.90%', uptimeVal: 99.90, cost: '$0.003 / call', costVal: 0.003, failoverHealth: '99.5%', endpoint: '/v1/scrape', description: 'Turn any complex JS website into clean, LLM-ready markdown in seconds.' },
  { rank: 4, trend: 'up', trendValue: 3, providerId: 'e2b', name: 'E2B Code Sandbox', provider: 'E2B', category: 'Code', score: 94.3, latency: '890ms', latencyMs: 890, p50Latency: '750ms', p90Latency: '1.2s', p99Latency: '2.1s', uptime: '99.85%', uptimeVal: 99.85, cost: '$0.005 / call', costVal: 0.005, failoverHealth: '99.9%', endpoint: '/v1/execute', description: 'Secure Firecracker microVM sandboxes for executing arbitrary Python and JS code.' },
  { rank: 5, trend: 'down', trendValue: 1, providerId: 'browserbase', name: 'Browserbase Headless', provider: 'Browserbase', category: 'Browser', score: 93.8, latency: '1.2s', latencyMs: 1200, p50Latency: '1.1s', p90Latency: '1.8s', p99Latency: '3.2s', uptime: '99.80%', uptimeVal: 99.80, cost: '$0.008 / call', costVal: 0.008, failoverHealth: '99.2%', endpoint: '/v1/browser', description: 'Developer-first headless browser infrastructure in the cloud with captcha solving.' },
  { rank: 6, trend: 'flat', trendValue: 0, providerId: 'serper', name: 'Serper Google Search', provider: 'Serper', category: 'Search', score: 92.1, latency: '210ms', latencyMs: 210, p50Latency: '190ms', p90Latency: '290ms', p99Latency: '510ms', uptime: '99.75%', uptimeVal: 99.75, cost: '$0.001 / call', costVal: 0.001, failoverHealth: '99.7%', endpoint: '/v1/search', description: 'Fast, structured Google Search results API with knowledge graph integration.' },
  { rank: 7, trend: 'up', trendValue: 2, providerId: 'jina', name: 'Jina Reader API', provider: 'Jina', category: 'Scraping', score: 90.5, latency: '410ms', latencyMs: 410, p50Latency: '360ms', p90Latency: '580ms', p99Latency: '1.1s', uptime: '99.65%', uptimeVal: 99.65, cost: '$0.002 / call', costVal: 0.002, failoverHealth: '99.1%', endpoint: '/v1/scrape', description: 'Zero-config URL to Markdown parser with built-in prompt optimization.' },
  { rank: 8, trend: 'down', trendValue: 2, providerId: 'steel', name: 'Steel Browser Cloud', provider: 'Steel', category: 'Browser', score: 89.3, latency: '1.5s', latencyMs: 1500, p50Latency: '1.3s', p90Latency: '2.1s', p99Latency: '4.0s', uptime: '99.60%', uptimeVal: 99.60, cost: '$0.009 / call', costVal: 0.009, failoverHealth: '98.9%', endpoint: '/v1/browser', description: 'Open-source browser automation platform for complex multi-step web agents.' },
  { rank: 9, trend: 'up', trendValue: 1, providerId: 'llamaparse', name: 'LlamaParse Doc Parser', provider: 'LlamaIndex', category: 'Document', score: 91.8, latency: '1.8s', latencyMs: 1800, p50Latency: '1.5s', p90Latency: '2.9s', p99Latency: '5.2s', uptime: '99.88%', uptimeVal: 99.88, cost: '$0.004 / call', costVal: 0.004, failoverHealth: '99.6%', endpoint: '/v1/document', description: 'GenAI document parsing for complex PDF tables, charts, and spatial layouts.' },
];

const CATEGORY_BADGES: Record<string, string> = {
  Search:   'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Scraping: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  Code:     'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Browser:  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Document: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

function getLatencyColor(ms: number) {
  if (ms < 300) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
  if (ms <= 1000) return 'text-amber-600 dark:text-amber-400 font-semibold';
  return 'text-rose-600 dark:text-rose-400 font-bold';
}

export const Rankings: React.FC = () => {
  const navigate = useNavigate();
  const [sort, setSort] = useState<'Score' | 'Latency' | 'Uptime' | 'Cost'>('Score');
  const [category, setCategory] = useState<'All' | 'Search' | 'Scraping' | 'Code' | 'Browser' | 'Document'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolBenchmark | null>(null);
  const [vaultModalProvider, setVaultModalProvider] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleOpenVaultModal = (providerId: string) => {
    const meta = PROVIDER_META[providerId] || {
      id: providerId,
      name: providerId,
      endpoint: '/v1/search',
    };
    setVaultModalProvider(meta);
  };

  const handleRunLiveBenchmark = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Filter & Sort Logic
  const filteredRankings = useMemo(() => {
    return MOCK_RANKINGS
      .filter(item => category === 'All' || item.category === category)
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === 'Score') return b.score - a.score;
        if (sort === 'Latency') return a.latencyMs - b.latencyMs;
        if (sort === 'Uptime') return b.uptimeVal - a.uptimeVal;
        if (sort === 'Cost') return a.costVal - b.costVal;
        return 0;
      });
  }, [category, searchQuery, sort]);

  // Top 3 Podium Items
  const top3Podium = useMemo(() => {
    const sortedByScore = [...MOCK_RANKINGS].sort((a, b) => b.score - a.score);
    return {
      first: sortedByScore[0],
      second: sortedByScore[1],
      third: sortedByScore[2],
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans selection:bg-lime-400 selection:text-zinc-950">

      {/* ── BENCHMARK HEADER & TOP-RIGHT CONTROLS ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-lime-600 dark:text-lime-400 font-bold">Rankings &amp; Benchmarks</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Tool Performance Benchmarks</span>
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Live latency, uptime SLA, and cost efficiency rankings across all connected provider engines, updated hourly.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto font-mono text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Updated 12m ago • 150+ Benchmarked</span>
          </div>

          <button
            onClick={handleRunLiveBenchmark}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Run Live Benchmark</span>
          </button>
        </div>
      </div>

      {/* ── TOP 3 SPOTLIGHT PODIUM CARDS (3 COLS GRID) ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 🥇 #1 OVERALL RANK SPOTLIGHT */}
        {top3Podium.first && (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-lime-500/10 via-white to-white dark:via-zinc-900/60 dark:to-zinc-900/60 border border-lime-500/40 shadow-[0_0_25px_rgba(163,230,53,0.1)] relative space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-lime-500/20 text-lime-700 dark:text-lime-300 font-mono font-extrabold text-xs flex items-center gap-1 border border-lime-500/30">
                <Crown className="w-3.5 h-3.5 fill-lime-500" /> #1 Overall Top Performer
              </span>
              <span className="text-2xl font-black text-amber-500">🥇</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <ProviderBrandIcon providerId={top3Podium.first.providerId} name={top3Podium.first.name} />
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">{top3Podium.first.name}</h3>
                <span className="text-xs text-zinc-500 font-mono">by {top3Podium.first.provider} · {top3Podium.first.endpoint}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Score</span>
                <span className="text-base font-extrabold text-lime-600 dark:text-lime-400">{top3Podium.first.score}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Latency</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{top3Podium.first.latency}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Uptime</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{top3Podium.first.uptime}</span>
              </div>
            </div>
          </div>
        )}

        {/* 🥈 #2 RUNNER-UP SPOTLIGHT */}
        {top3Podium.second && (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-200/50 via-white to-white dark:from-zinc-800/50 dark:via-zinc-900/60 dark:to-zinc-900/60 border border-zinc-300 dark:border-zinc-700/80 shadow-sm relative space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs flex items-center gap-1 border border-zinc-300 dark:border-zinc-700">
                <Medal className="w-3.5 h-3.5 text-zinc-400" /> #2 High-Throughput Engine
              </span>
              <span className="text-2xl font-black text-zinc-400">🥈</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <ProviderBrandIcon providerId={top3Podium.second.providerId} name={top3Podium.second.name} />
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">{top3Podium.second.name}</h3>
                <span className="text-xs text-zinc-500 font-mono">by {top3Podium.second.provider} · {top3Podium.second.endpoint}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Score</span>
                <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">{top3Podium.second.score}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Latency</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{top3Podium.second.latency}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Uptime</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{top3Podium.second.uptime}</span>
              </div>
            </div>
          </div>
        )}

        {/* 🥉 #3 BRONZE SPOTLIGHT */}
        {top3Podium.third && (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-white to-white dark:via-zinc-900/60 dark:to-zinc-900/60 border border-amber-500/30 shadow-sm relative space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs flex items-center gap-1 border border-amber-500/20">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> #3 Scrape &amp; Parsing Leader
              </span>
              <span className="text-2xl font-black text-amber-700">🥉</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <ProviderBrandIcon providerId={top3Podium.third.providerId} name={top3Podium.third.name} />
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">{top3Podium.third.name}</h3>
                <span className="text-xs text-zinc-500 font-mono">by {top3Podium.third.provider} · {top3Podium.third.endpoint}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Score</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{top3Podium.third.score}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Latency</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{top3Podium.third.latency}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Uptime</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{top3Podium.third.uptime}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── REACTIVE SEARCH, CATEGORY FILTERS & MULTI-SORT TOOLBAR ────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-4 font-sans">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs placeholder-zinc-400 focus:border-lime-500 focus:outline-none transition-colors font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Toggle Group */}
          <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs shrink-0">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider shrink-0">Sort By:</span>
            <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {(['Score', 'Latency', 'Uptime', 'Cost'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSort(opt)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    sort === opt
                      ? 'bg-lime-400 text-zinc-950 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {opt === 'Score' ? 'Score (High)' : opt === 'Latency' ? 'Latency (Fast)' : opt === 'Uptime' ? 'Uptime SLA' : 'Cost (Low)'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {(['All', 'Search', 'Scraping', 'Code', 'Browser', 'Document'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-lime-400 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ── HIGH-POLISH LEADERBOARD TABLE ───────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm dark:shadow-2xl font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="py-3.5 px-4 font-semibold w-16">RANK</th>
                <th className="py-3.5 px-4 font-semibold">TOOL ENGINE</th>
                <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
                <th className="py-3.5 px-4 font-semibold">SCORE</th>
                <th className="py-3.5 px-4 font-semibold">LATENCY</th>
                <th className="py-3.5 px-4 font-semibold">UPTIME SLA</th>
                <th className="py-3.5 px-4 font-semibold text-right">COST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-zinc-400 font-mono">
                    No benchmarked tool engines match your search query.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((row, i) => {
                  const displayRank = i + 1;
                  const latencyClass = getLatencyColor(row.latencyMs);

                  return (
                    <tr
                      key={row.name}
                      onClick={() => setSelectedTool(row)}
                      className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    >
                      {/* RANK Column */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          {displayRank === 1 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                              🥇 1
                            </span>
                          ) : displayRank === 2 ? (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs font-bold">
                              🥈 2
                            </span>
                          ) : displayRank === 3 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-700/10 text-amber-700 dark:text-amber-500 border border-amber-700/20 text-xs font-bold">
                              🥉 3
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                              <span>#{displayRank}</span>
                              {row.trend === 'up' && (
                                <span className="text-[10px] text-emerald-500 flex items-center font-semibold">
                                  <ArrowUpRight className="w-3 h-3" />+{row.trendValue}
                                </span>
                              )}
                              {row.trend === 'down' && (
                                <span className="text-[10px] text-rose-500 flex items-center font-semibold">
                                  <ArrowDownRight className="w-3 h-3" />-{row.trendValue}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* TOOL ENGINE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ProviderBrandIcon providerId={row.providerId} name={row.name} />
                          <div>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors block">
                              {row.name}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono block">
                              by {row.provider} · {row.endpoint}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_BADGES[row.category] || 'bg-zinc-100 text-zinc-700'}`}>
                          {row.category}
                        </span>
                      </td>

                      {/* SCORE with Visual Progress Meter */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-1 w-24">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 block">
                            {row.score}
                          </span>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-lime-500 h-full rounded-full"
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* LATENCY */}
                      <td className={`py-3.5 px-4 font-mono ${latencyClass}`}>
                        {row.latency}
                      </td>

                      {/* UPTIME SLA */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold">
                          {row.uptime}
                        </span>
                      </td>

                      {/* COST */}
                      <td className="py-3.5 px-4 font-mono text-right text-zinc-700 dark:text-zinc-300 font-semibold">
                        {row.cost}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INTERACTIVE PROVIDER PERFORMANCE DRILLDOWN DRAWER ──────────────── */}
      <ProviderPerformanceDrawer
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
        onOpenVaultModal={(providerId) => handleOpenVaultModal(providerId)}
      />

      {/* ── KEY CONFIGURATION VAULT MODAL ───────────────────────────────────── */}
      {vaultModalProvider && (
        <KeyConfigModal
          isOpen={true}
          provider={vaultModalProvider}
          onClose={() => setVaultModalProvider(null)}
        />
      )}

    </div>
  );
};
