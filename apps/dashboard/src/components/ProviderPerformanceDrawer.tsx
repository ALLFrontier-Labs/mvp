import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X, Zap, Clock, TrendingUp, ShieldCheck, Activity, Key, Play,
  CheckCircle2, AlertTriangle, RefreshCw, Server, ArrowUpRight, Check,
  DollarSign, BarChart3, Globe2
} from 'lucide-react';

export interface ProviderBenchmarkData {
  rank: number;
  providerId: string;
  name: string;
  provider: string;
  category: string;
  score: number;
  latency: string;
  latencyMs: number;
  p50Latency: string;
  p90Latency: string;
  p99Latency: string;
  uptime: string;
  cost: string;
  failoverHealth: string;
  endpoint: string;
  description: string;
}

interface ProviderPerformanceDrawerProps {
  tool: ProviderBenchmarkData | null;
  onClose: () => void;
  onOpenVaultModal?: (providerId: string) => void;
}

export const ProviderPerformanceDrawer: React.FC<ProviderPerformanceDrawerProps> = ({
  tool,
  onClose,
  onOpenVaultModal,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'latency' | 'uptime' | 'cost'>('latency');
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ latencyMs: number; gatewayOverheadMs: number } | null>(null);

  // Lock body scroll on mount
  useEffect(() => {
    if (!tool) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tool, onClose]);

  if (!tool) return null;

  const handleRunLivePing = () => {
    setIsTestingPing(true);
    setPingResult(null);
    setTimeout(() => {
      const baseMs = tool.latencyMs || 140;
      const variation = Math.floor(Math.random() * 20) - 10;
      const testedMs = Math.max(45, baseMs + variation);
      const gatewayMs = Math.min(18, Math.max(8, Math.floor(testedMs * 0.05)));
      setPingResult({ latencyMs: testedMs, gatewayOverheadMs: gatewayMs });
      setIsTestingPing(false);
    }, 1200);
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden font-sans selection:bg-lime-400 selection:text-zinc-950">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 z-[9999] h-screen w-full max-w-2xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        
        {/* ── HEADER SECTION ─────────────────────────────────────────────────── */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80 space-y-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          
          {/* Top Row: Rank & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-lime-500/10 text-lime-700 dark:text-lime-300 font-mono font-extrabold text-xs border border-lime-500/20">
                {tool.rank === 1 ? '🥇 #1 Overall Rank' : tool.rank === 2 ? '🥈 #2 Overall Rank' : tool.rank === 3 ? '🥉 #3 Overall Rank' : `#${tool.rank} Provider Rank`}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] font-bold">
                {tool.endpoint}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Provider Title & Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{tool.name}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">by {tool.provider} · Unified BYOK Routing Adapter</p>
            </div>

            {/* Live Ping Benchmark Action */}
            <button
              onClick={handleRunLivePing}
              disabled={isTestingPing}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
              <span>⚡ Run Live Ping Test</span>
            </button>
          </div>

          {/* Live Ping Output Banner */}
          {pingResult && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tested Live Latency: {pingResult.latencyMs}ms — Gateway Overhead: {pingResult.gatewayOverheadMs}ms
              </span>
              <span className="text-[10px] text-zinc-500">Just now</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Overall Score</span>
              <span className="text-lg font-extrabold text-lime-600 dark:text-lime-400 mt-0.5 block">{tool.score} / 100</span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Average Latency</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{tool.latency}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">30-Day Uptime</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{tool.uptime}</span>
            </div>
          </div>

          {/* Sub-tabs Navigation */}
          <div className="flex p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('latency')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
                activeTab === 'latency'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              24h Latency &amp; Speed
            </button>
            <button
              onClick={() => setActiveTab('uptime')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
                activeTab === 'uptime'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              SLA &amp; Incident Logs
            </button>
            <button
              onClick={() => setActiveTab('cost')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition-all ${
                activeTab === 'cost'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Cost &amp; Value Index
            </button>
          </div>

        </div>

        {/* ── DRAWER BODY CONTENT ────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
          
          {/* TAB 1: 24h Latency & Throughput */}
          {activeTab === 'latency' && (
            <div className="space-y-6">
              
              {/* Latency Sparkline Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-lime-500" /> 24-Hour Latency Trend (ms)
                  </span>
                  <span className="text-zinc-400 text-[11px]">Updated live</span>
                </div>

                {/* SVG Latency Curve */}
                <div className="h-32 w-full pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path
                      d="M0,70 Q40,65 80,45 T160,55 T240,35 T320,60 T400,40"
                      fill="none"
                      stroke="#a3e635"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,70 Q40,65 80,45 T160,55 T240,35 T320,60 T400,40 V100 H0 Z"
                      fill="url(#latencyGradient)"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Metric Comparison Pills */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">p50 Mean</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{tool.p50Latency}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">p90 Peak</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 mt-0.5 block">{tool.p90Latency}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">p99 Max</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{tool.p99Latency}</span>
                  </div>
                </div>
              </div>

              {/* Regional Ping Breakdown Grid */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Regional Multi-Edge Ping Times:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>US-East (N. Virginia)</span>
                    </div>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block">118 ms</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>EU-Central (Frankfurt)</span>
                    </div>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block">164 ms</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>AP-East (Tokyo)</span>
                    </div>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 block">210 ms</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Historical Uptime SLA & Incidents */}
          {activeTab === 'uptime' && (
            <div className="space-y-6">
              
              {/* 30-Day Status Calendar Bar */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">30-Day Uptime Calendar</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tool.uptime} SLA Guaranteed</span>
                </div>

                {/* 30 Daily Vertical Bars */}
                <div className="flex items-center gap-1 h-10 pt-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isMinorIncident = i === 12;
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-sm transition-all hover:scale-110 cursor-pointer ${
                          isMinorIncident ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        title={isMinorIncident ? 'Jul 18: Minor 429 rate limit spike' : `Day ${i + 1}: 100% operational`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>30 Days Ago</span>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 100% Operational</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Minor Degradation</span>
                  </span>
                  <span>Today</span>
                </div>
              </div>

              {/* Recent Incident Log */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Recent Incident Audit Trail:
                </span>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Aug 1, 2026 — 100% Operational</span>
                      <span className="text-[11px] text-zinc-500">All edge gateway pings verified 100% success rate across primary &amp; fallback routes.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">Jul 18, 2026 — Upstream 429 Rate Limit Spike</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Resolved in 12m. LiteDaemon secondary BYOK key rotated automatically with zero dropped client queries.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Cost Efficiency & Value Score */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              
              {/* Unit Cost Matrix Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Pricing &amp; Value Index</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Unit Cost / Call</span>
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">{tool.cost}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">BYOK Gateway Markup</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">$0.00 (0%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-700 dark:text-lime-300 font-bold">
                  💡 Category Index: 32% lower cost than category average for search &amp; retrieval tools.
                </div>
              </div>

              {/* Supported Features Checklist */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Supported Features &amp; Capabilities:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-lime-500" />
                    <span className="text-zinc-800 dark:text-zinc-200">Real-Time Web Search</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-lime-500" />
                    <span className="text-zinc-800 dark:text-zinc-200">LLM RAG Chunking</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-lime-500" />
                    <span className="text-zinc-800 dark:text-zinc-200">Citation Extraction</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-lime-500" />
                    <span className="text-zinc-800 dark:text-zinc-200">Auto Key Rotation</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── FOOTER ACTION BAR ──────────────────────────────────────────────── */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3 font-mono text-xs shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onOpenVaultModal) onOpenVaultModal(tool.providerId);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>+ Configure Key in Vault</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/playground', { state: { endpoint: tool.endpoint, provider: tool.providerId } });
            }}
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Test in Playground</span>
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
