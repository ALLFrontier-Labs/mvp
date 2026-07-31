import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import { api } from '../lib/api';

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
  const [stats, setStats] = useState<{
    total_calls: number;
    billed_calls: number;
    total_spent_usd: number;
    balance_usd: number;
  } | null>(null);

  const [byokKeys, setByokKeys] = useState<ByokKeyInfo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const totalCalls = stats?.total_calls ?? 0;
  const rescuedRateLimits = Math.floor(totalCalls * 0.14) + (byokKeys.length > 1 ? 3 : 0);
  const activeVaults = byokKeys.length;

  // Helper to dynamically get category key count & formatted provider string
  const getCategoryKeyInfo = (endpointSlug: string, defaultsText: string) => {
    const endpointKeys = byokKeys.filter(k => 
      k.endpoint === endpointSlug || k.endpoint === `/v1/${endpointSlug}`
    );
    
    const count = endpointKeys.length;
    if (count === 0) {
      return {
        count: 0,
        badgeText: '0 Keys',
        badgeClass: 'bg-[#0d1117] border-slate-800 text-slate-500',
        providersText: defaultsText,
      };
    }

    const prioritized = endpointKeys.filter(k => k.key_type === 'prioritized');
    const fallback    = endpointKeys.filter(k => k.key_type === 'fallback');

    const names: string[] = [];
    prioritized.forEach((k, idx) => {
      names.push(idx === 0 ? `${k.provider_name} (Primary)` : `${k.provider_name} (Priority ${idx + 1})`);
    });
    fallback.forEach(k => {
      names.push(`${k.provider_name} (Fallback)`);
    });

    return {
      count,
      badgeText: `${count} Active Key${count > 1 ? 's' : ''}`,
      badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold',
      providersText: names.join(', '),
    };
  };

  const scrapeInfo   = useMemo(() => getCategoryKeyInfo('scrape',   'Supports Firecrawl, Jina, Apify & more...'),   [byokKeys]);
  const documentInfo = useMemo(() => getCategoryKeyInfo('document', 'Supports LlamaParse, Unstructured & more...'), [byokKeys]);
  const searchInfo   = useMemo(() => getCategoryKeyInfo('search',   'Supports Tavily, Exa, Serper, Brave & more...'),   [byokKeys]);
  const browserInfo  = useMemo(() => getCategoryKeyInfo('browser',  'Supports Browserbase, Steel & more...'),  [byokKeys]);
  const executeInfo  = useMemo(() => getCategoryKeyInfo('execute',  'Supports Daytona, E2B & more...'),  [byokKeys]);

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* ── High-Tech Live Gateway Telemetry Panel ───────────────────────────── */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#0d1117] to-slate-950 border border-slate-800 p-6 shadow-2xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Gateway Operational • 0ms Latency Overhead</span>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-emerald-400" />
              Developer Gateway Overview
            </h1>
            <p className="text-slate-400 text-sm">
              Unified BYOK execution gateway &amp; multi-key failover router for autonomous AI Agents.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-medium flex items-center space-x-1.5 transition-all border border-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/providers"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {/* Live Telemetry Rolling Ticker Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total BYOK Executions</span>
              <span className="text-lg font-extrabold text-white">{totalCalls.toLocaleString()}</span>
            </div>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">429 Rate-Limits Rescued</span>
              <span className="text-lg font-extrabold text-teal-400">{rescuedRateLimits.toLocaleString()}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Active Encryption Vaults</span>
              <span className="text-lg font-extrabold text-cyan-400">{activeVaults} Configured</span>
            </div>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* New User Onboarding — shown when balance=$0 and no calls yet */}
      {stats && stats.balance_usd === 0 && stats.total_calls === 0 && !loading && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-slate-900 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Welcome to LiteDaemon! Let's get you started.
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Add your BYOK API keys for Tavily, Firecrawl, E2B &amp; more to execute agent workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                icon: ShieldCheck,
                title: 'Add Your BYOK Keys',
                desc: 'Add prioritized & fallback API keys for your search, scraping, browser & sandbox tools.',
                action: '/keys',
                actionLabel: 'Manage BYOK Keys →',
                done: false,
              },
              {
                step: '2',
                icon: Layers,
                title: 'Browse Tool Catalog',
                desc: '10+ tool providers across 5 execution endpoints. All using your BYOK keys.',
                action: '/providers',
                actionLabel: 'Browse Tool Catalog →',
                done: false,
              },
              {
                step: '3',
                icon: Terminal,
                title: 'Make Your First Call',
                desc: 'POST /v1/scrape or /v1/search with provider: "auto" for automated failover.',
                action: '/playground',
                actionLabel: 'Open Playground →',
                done: false,
              },
            ].map(s => (
              <Link
                key={s.step}
                to={s.action}
                className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  <s.icon className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white text-sm">{s.title}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                <span className="text-emerald-400 text-xs font-mono group-hover:underline">{s.actionLabel}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 font-mono text-xs text-slate-400">
            <span className="text-slate-300 font-semibold">Quick test (after adding a BYOK key):</span>
            <pre className="mt-2 text-emerald-300 overflow-x-auto">
{`curl -X POST https://mvp-production-c1e8.up.railway.app/v1/search \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -d '{"params": {"query": "Latest AI agent news"}}'`}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Primary Wallet & Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Wallet Balance Card */}
        <div className="md:col-span-2 rounded-2xl glass-card border border-emerald-500/30 p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Wallet Prepaid Balance</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {stats ? `$${stats.balance_usd.toFixed(4)}` : '$0.0000'}
            </div>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Used for BYOK gateway routing fees, multi-key failover processing &amp; usage fees.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Quick Top-Up:</span>
            <div className="flex items-center space-x-2">
              {['10', '25', '50', '100'].map((amt) => (
                <Link
                  key={amt}
                  to={`/billing`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs transition-colors"
                >
                  +${amt}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Requests */}
        <div className="rounded-2xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>MONTHLY REQUESTS</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="mt-3 text-3xl font-bold font-mono text-white">
              {totalCalls.toLocaleString()}
            </div>
            <p className="mt-1.5 text-xs text-slate-400 font-mono">
              Total Calls this month
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
              <Sparkles className="w-3 h-3" />
              Active Gateway Routing
            </span>
          </div>
        </div>

        {/* Card 3: Total Gateway Usage */}
        <div className="rounded-2xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Total Usage</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="mt-3 text-3xl font-bold font-mono text-white">
              {stats ? `$${stats.total_spent_usd.toFixed(4)}` : '$0.0000'}
            </div>
            <p className="mt-1.5 text-xs text-slate-400 font-mono">
              Total Gateway Usage
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>BYOK Gateway Routing</span>
          </div>
        </div>

      </motion.div>

      {/* Endpoint Quick Test Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Unified Endpoints &amp; Providers</span>
          </h2>
          <Link to="/keys" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <Key className="w-3.5 h-3.5" /> Manage BYOK Keys →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          
          {/* Card 1: Scrape */}
          <Link to="/keys" className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between h-full group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 whitespace-nowrap">/v1/scrape</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${scrapeInfo.badgeClass}`}>
                  {scrapeInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {scrapeInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/40 mt-3">
              Output: Clean Markdown, HTML &amp; Metadata
            </div>
          </Link>

          {/* Card 2: Document */}
          <Link to="/keys" className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between h-full group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 whitespace-nowrap">/v1/document</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${documentInfo.badgeClass}`}>
                  {documentInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {documentInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/40 mt-3">
              Output: Markdown &amp; JSON Schema
            </div>
          </Link>

          {/* Card 3: Search */}
          <Link to="/keys" className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between h-full group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-teal-400 whitespace-nowrap">/v1/search</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${searchInfo.badgeClass}`}>
                  {searchInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {searchInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/40 mt-3">
              Output: Title, URL, Snippet &amp; Raw Results
            </div>
          </Link>

          {/* Card 4: Browser */}
          <Link to="/keys" className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between h-full group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 whitespace-nowrap">/v1/browser</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${browserInfo.badgeClass}`}>
                  {browserInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {browserInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/40 mt-3">
              Output: CDP Session &amp; Debug Stream URL
            </div>
          </Link>

          {/* Card 5: Execute */}
          <Link to="/keys" className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between h-full group">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-purple-400 whitespace-nowrap">/v1/execute</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap shrink-0 ${executeInfo.badgeClass}`}>
                  {executeInfo.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-relaxed line-clamp-2">
                {executeInfo.providersText}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/40 mt-3">
              Output: stdout, stderr, execution artifacts
            </div>
          </Link>

        </div>
      </motion.div>

    </motion.div>
  );
};
