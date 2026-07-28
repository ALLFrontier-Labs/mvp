import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    total_calls: number;
    billed_calls: number;
    total_spent_usd: number;
    balance_usd: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsage();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load account usage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Developer Gateway Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Zero margin gateway for Scrape, Search, Browser sessions & Code Execution.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadUsage}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/providers"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Layers className="w-4 h-4" />
            <span>View 10 Providers</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New User Onboarding — shown when balance=$0 and no calls yet */}
      {stats && stats.balance_usd === 0 && stats.total_calls === 0 && !loading && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-slate-900 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Welcome to LiteDaemon! Let's get you started.
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Replace 4+ provider subscriptions with one prepaid wallet. Three steps to your first call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                icon: Terminal,
                title: 'Deposit Credits',
                desc: 'Add $5+ to your prepaid wallet. No monthly commitment.',
                action: '/billing',
                actionLabel: 'Deposit Now →',
                done: false,
              },
              {
                step: '2',
                icon: Layers,
                title: 'Browse Providers',
                desc: '10 providers: scraping, search, browser, code exec. All at wholesale rates.',
                action: '/providers',
                actionLabel: 'Browse Catalog →',
                done: false,
              },
              {
                step: '3',
                icon: Terminal,
                title: 'Make Your First Call',
                desc: 'POST /v1/scrape or /v1/search with provider: "auto" — we pick the best.',
                action: '/settings',
                actionLabel: 'Get Code Snippet →',
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
            <span className="text-slate-300 font-semibold">Quick test (after depositing):</span>
            <pre className="mt-2 text-emerald-300 overflow-x-auto">
{`curl -X POST https://mvp-production-c1e8.up.railway.app/v1/scrape \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"params": {"url": "https://example.com"}}'`}
            </pre>
          </div>
        </div>
      )}

      {/* Primary Wallet & Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Wallet Balance Card (Large Green Accent) */}
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
            <p className="mt-1 text-xs text-slate-400">
              Debited at exact wholesale cost — zero platform margin.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Quick Top-Up:</span>
            <div className="flex items-center space-x-2">
              {['10', '25', '50', '100'].map((amt) => (
                <Link
                  key={amt}
                  to={`/billing`}
                  onClick={() => {}}
                  state={{ amount: amt }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs transition-colors"
                >
                  +${amt}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Total API Calls */}
        <div className="rounded-2xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Total Calls</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="mt-3 text-3xl font-bold font-mono text-white">
              {stats ? stats.total_calls.toLocaleString() : '0'}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {stats ? `${stats.billed_calls} billed calls` : '0 billed'}
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>4 Endpoints Active</span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
            <span>Total Spent</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="mt-3 text-3xl font-bold font-mono text-white">
              {stats ? `$${stats.total_spent_usd.toFixed(4)}` : '$0.0000'}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Micro-billed at 8 decimal places
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Passed to Providers</span>
          </div>
        </div>

      </div>

      {/* Endpoint Quick Test Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Unified Endpoints & Providers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-xl bg-[#121620]/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-emerald-400">POST /v1/scrape</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">4 Providers</span>
            </div>
            <p className="text-xs text-slate-400">Firecrawl, Jina AI, Apify, Spider Cloud</p>
            <div className="text-[11px] text-slate-500 font-mono">Output: Markdown + Metadata</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121620]/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-teal-400">POST /v1/search</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">3 Providers</span>
            </div>
            <p className="text-xs text-slate-400">Tavily, Exa AI, Serper.dev</p>
            <div className="text-[11px] text-slate-500 font-mono">Output: Title, URL, Snippet</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121620]/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">POST /v1/browser</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">2 Providers</span>
            </div>
            <p className="text-xs text-slate-400">Browserbase, Steel Browser</p>
            <div className="text-[11px] text-slate-500 font-mono">Output: CDP & Debug URL</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121620]/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-purple-400">POST /v1/execute</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">1 Provider</span>
            </div>
            <p className="text-xs text-slate-400">E2B Code Sandbox</p>
            <div className="text-[11px] text-slate-500 font-mono">Output: stdout, stderr, exit code</div>
          </div>

        </div>
      </div>

    </div>
  );
};
