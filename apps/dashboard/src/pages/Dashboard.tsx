import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Activity, 
  DollarSign, 
  ArrowUpRight, 
  Zap, 
  Terminal, 
  Layers, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Key,
  Radio,
  Cpu,
  Lock,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { api } from '../lib/api';
import { UsageBanner } from '../components/UsageBanner';
import { EndpointDrawer } from '../components/EndpointDrawer';
import { TopUpModal } from '../components/TopUpModal';

interface ByokKeyInfo {
  id: string;
  provider_id: string;
  provider_name: string;
  endpoint: string;
  key_type: 'prioritized' | 'fallback';
  priority_order: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<{
    total_calls: number;
    billed_calls: number;
    total_spent_usd: number;
    balance_usd: number;
  } | null>(null);

  const [byokKeys, setByokKeys] = useState<ByokKeyInfo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Drawer and Modal States
  const [drawerEndpoint, setDrawerEndpoint] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usageData, keysData] = await Promise.all([
        api.getUsage().catch(() => null),
        api.listKeys().catch(() => ({ keys: [] })),
      ]);
      if (usageData) setStats(usageData);
      if (keysData?.keys) setByokKeys(keysData.keys as any);
    } catch (err: any) {
      setError(err.message || 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCalls = stats?.total_calls ?? 0;
  // Failover count is not tracked by the backend yet — display real data only
  const activeVaults = byokKeys.length;

  // Drawer opener handler
  const handleOpenDrawer = (ep: string) => {
    setDrawerEndpoint(ep);
    setIsDrawerOpen(true);
  };

  // Top-Up modal opener handler
  const handleOpenTopUp = (amt: number = 10) => {
    setTopUpAmount(amt);
    setIsTopUpOpen(true);
  };

  // Helper to dynamically get category key count & formatted provider string
  const getCategoryKeyInfo = (endpointSlug: string, defaultsText: string) => {
    const endpointKeys = byokKeys.filter(k => 
      k.endpoint === endpointSlug || k.endpoint === `/v1/${endpointSlug}`
    );
    
    const count = endpointKeys.length;
    if (count === 0) {
      return {
        count: 0,
        badgeText: 'Pass-through',
        badgeClass: 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50',
        providersText: defaultsText,
      };
    }

    return {
      count,
      badgeText: `${count} Active Key${count > 1 ? 's' : ''}`,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold',
      providersText: defaultsText,
    };
  };

  const scrapeInfo   = useMemo(() => getCategoryKeyInfo('scrape',   'Firecrawl, Jina, Apify & Spider'),   [byokKeys]);
  const documentInfo = useMemo(() => getCategoryKeyInfo('document', 'LlamaParse & Document AI'), [byokKeys]);
  const searchInfo   = useMemo(() => getCategoryKeyInfo('search',   'Tavily, Exa & Serper'),   [byokKeys]);
  const browserInfo  = useMemo(() => getCategoryKeyInfo('browser',  'Browserbase & Steel Browser'),  [byokKeys]);
  const executeInfo  = useMemo(() => getCategoryKeyInfo('execute',  'E2B & Daytona Sandboxes'),  [byokKeys]);

  const activeKeyForEndpoint = (ep: string) => {
    switch(ep) {
      case '/v1/scrape': return scrapeInfo.count;
      case '/v1/document': return documentInfo.count;
      case '/v1/search': return searchInfo.count;
      case '/v1/browser': return browserInfo.count;
      case '/v1/execute': return executeInfo.count;
      default: return 0;
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* ── ROW 1: Gateway Control Center Telemetry Header ─────────────────── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-sm dark:shadow-2xl transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-lime-500/10 transition-all" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-semibold">Gateway Operational • 0ms Latency Overhead</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <Cpu className="w-7 h-7 text-lime-600 dark:text-lime-400" />
              Gateway Control Center
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Real-time BYOK routing, tool execution metrics, and vault security.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono font-medium flex items-center space-x-2 transition-all border border-zinc-200 dark:border-zinc-700/60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-lime-500' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/providers"
              className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs font-mono flex items-center space-x-2 transition-all shadow-md hover:shadow-lime-400/20"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── ROW 2: 3 High-Level Metric Stat Cards ───────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1: Total Tool Requests */}
        <div className="rounded-2xl p-6 border shadow-sm dark:shadow-none transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-sans uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
              Total Tool Requests
            </span>
            <span className="text-3xl font-extrabold font-sans text-zinc-900 dark:text-zinc-100 mt-2 block">
              {totalCalls.toLocaleString()}
            </span>
            <span className="text-[11px] font-sans text-zinc-400 dark:text-zinc-500 mt-1 block">
              Cumulative tool calls
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-lime-400 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Stat 2: BYOK Keys Active */}
        <div className="rounded-2xl p-6 border shadow-sm dark:shadow-none transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-sans uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
              Total Routing Fees
            </span>
            <span className="text-3xl font-extrabold font-sans text-teal-600 dark:text-teal-400 mt-2 block">
              ${stats ? stats.total_spent_usd.toFixed(4) : '0.0000'}
            </span>
            <span className="text-[11px] font-sans text-zinc-400 dark:text-zinc-500 mt-1 block">
              5% gateway pass-through
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Configured Keys */}
        <div 
          onClick={() => navigate('/keys')}
          className="rounded-2xl p-6 border shadow-sm dark:shadow-none transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <span className="text-xs font-sans uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block group-hover:text-cyan-500 transition-colors">
              Configured Keys →
            </span>
            <span className="text-3xl font-extrabold font-sans text-cyan-600 dark:text-cyan-400 mt-2 block">
              {activeVaults} Vaulted
            </span>
            <span className="text-[11px] font-sans text-zinc-400 dark:text-zinc-500 mt-1 block">
              AES-256-GCM encrypted
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
        </div>

      </motion.div>

      {/* ── ROW 3: Free Monthly Allowance Progress Banner ───────────────────── */}
      <motion.div variants={itemVariants}>
        <UsageBanner
          monthlyCallCount={stats?.total_calls || 0}
          balanceUsd={stats?.balance_usd || 0}
          onTopUpClick={() => handleOpenTopUp(10)}
        />
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* ── ROW 4: Two-Column Balance & Usage Split ──────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (40% width): Prepaid Credit Balance */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border shadow-sm dark:shadow-none transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl group-hover:bg-lime-500/20 transition-all pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-sans uppercase tracking-wider font-semibold">
              <span>Prepaid Credit Balance</span>
              <Wallet className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </div>

            <div>
              <div className="text-4xl font-extrabold font-sans text-zinc-900 dark:text-zinc-100 tracking-tight">
                {stats ? `$${stats.balance_usd.toFixed(2)}` : '$0.00'}
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                Used for gateway execution fees post 100 free monthly calls.
              </p>
            </div>

            {/* Quick Top-Up Pills */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans text-zinc-500 dark:text-zinc-400 font-semibold">
                  Quick Deposit Options:
                </span>
                <button
                  onClick={() => handleOpenTopUp(10)}
                  className="text-xs font-sans font-bold text-lime-600 dark:text-lime-400 hover:underline"
                >
                  Custom Amount →
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleOpenTopUp(amt)}
                    className="px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all bg-zinc-100 hover:bg-lime-400 hover:text-zinc-950 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-lime-400 dark:hover:text-zinc-950 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 shadow-sm"
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-sans text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-500" />
              Pay-As-You-Go Dodo Payments
            </span>
            <Link to="/billing" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
              Billing Ledger →
            </Link>
          </div>
        </div>

        {/* Right Column (60% width): Monthly Gateway Volume */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border shadow-sm dark:shadow-none transition-all duration-300 hover:border-lime-500/40 hover:shadow-[0_0_20px_rgba(163,230,53,0.08)] bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-sans uppercase tracking-wider font-semibold">
              <span>Monthly Volume</span>
              <span className="text-xs text-zinc-400 font-sans font-normal">Transparent usage pricing • Raw provider rates + 5% routing fee</span>
            </div>

            {/* Side-by-Side Volume Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-sans uppercase text-zinc-500 dark:text-zinc-400 block font-bold">
                  Total Calls Billed (Post 100)
                </span>
                <span className="text-2xl font-extrabold font-sans text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {stats?.billed_calls ?? 0} Calls
                </span>
                <span className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400 mt-1 block">
                  {stats && stats.total_calls <= 100 ? 'Covered by Free Allowance' : 'Standard 5% markup'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-sans uppercase text-zinc-500 dark:text-zinc-400 block font-bold">
                  Calculated Pass-Through Cost
                </span>
                <span className="text-2xl font-extrabold font-sans text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {stats ? `$${stats.total_spent_usd.toFixed(2)}` : '$0.00'}
                </span>
                <span className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400 mt-1 block">
                  Pass-through billing after 100 free calls
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-lime-500" />
              Transparent Micro-Billing
            </span>
            <Link to="/docs/billing" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
              Billing Specs →
            </Link>
          </div>
        </div>

      </motion.div>

      {/* ── ROW 5: Bottom Section — Unified Tool Endpoints Grid ─────────────── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <span>Unified Tool Endpoints</span>
          </h2>
          <Link to="/keys" className="text-xs font-mono text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1 font-bold">
            <Key className="w-3.5 h-3.5" /> Manage BYOK Keys →
          </Link>
        </div>

        {/* Clean 5-Column Grid with Non-Overflowing Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
          
          {/* Card 1: Scrape */}
          <div
            onClick={() => handleOpenDrawer('/v1/scrape')}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 group cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-medium text-xs text-lime-400 font-mono truncate">/v1/scrape</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 ${scrapeInfo.badgeClass}`}>
                  {scrapeInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {scrapeInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
              <span className="group-hover:text-lime-400 font-semibold transition-colors">Test Endpoint →</span>
              <Sliders className="w-3.5 h-3.5 text-lime-500 opacity-70 group-hover:opacity-100" />
            </div>
          </div>

          {/* Card 2: Document */}
          <div
            onClick={() => handleOpenDrawer('/v1/document')}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 group cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-medium text-xs text-lime-400 font-mono truncate">/v1/document</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 ${documentInfo.badgeClass}`}>
                  {documentInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {documentInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
              <span className="group-hover:text-lime-400 font-semibold transition-colors">Test Endpoint →</span>
              <Sliders className="w-3.5 h-3.5 text-lime-500 opacity-70 group-hover:opacity-100" />
            </div>
          </div>

          {/* Card 3: Search */}
          <div
            onClick={() => handleOpenDrawer('/v1/search')}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 group cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-medium text-xs text-lime-400 font-mono truncate">/v1/search</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 ${searchInfo.badgeClass}`}>
                  {searchInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {searchInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
              <span className="group-hover:text-lime-400 font-semibold transition-colors">Test Endpoint →</span>
              <Sliders className="w-3.5 h-3.5 text-lime-500 opacity-70 group-hover:opacity-100" />
            </div>
          </div>

          {/* Card 4: Browser */}
          <div
            onClick={() => handleOpenDrawer('/v1/browser')}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 group cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-medium text-xs text-lime-400 font-mono truncate">/v1/browser</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 ${browserInfo.badgeClass}`}>
                  {browserInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {browserInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
              <span className="group-hover:text-lime-400 font-semibold transition-colors">Test Endpoint →</span>
              <Sliders className="w-3.5 h-3.5 text-lime-500 opacity-70 group-hover:opacity-100" />
            </div>
          </div>

          {/* Card 5: Execute */}
          <div
            onClick={() => handleOpenDrawer('/v1/execute')}
            className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 group cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-medium text-xs text-lime-400 font-mono truncate">/v1/execute</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 ${executeInfo.badgeClass}`}>
                  {executeInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {executeInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-3 flex items-center justify-between">
              <span className="group-hover:text-lime-400 font-semibold transition-colors">Test Endpoint →</span>
              <Sliders className="w-3.5 h-3.5 text-lime-500 opacity-70 group-hover:opacity-100" />
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Slide-Over Endpoint Drawer ────────────────────────────────────────── */}
      <EndpointDrawer
        isOpen={isDrawerOpen}
        endpoint={drawerEndpoint}
        onClose={() => setIsDrawerOpen(false)}
        activeKeyCount={drawerEndpoint ? activeKeyForEndpoint(drawerEndpoint) : 0}
      />

      {/* ── Live Prepaid Wallet Top-Up Modal ─────────────────────────────────── */}
      <TopUpModal
        isOpen={isTopUpOpen}
        initialAmount={topUpAmount}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => loadData()}
      />

    </motion.div>
  );
};
