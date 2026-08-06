import React from 'react';
import { ToolDetail } from '../../types/tool-detail';

export function ToolMetricsSections({ tool }: { tool: ToolDetail }) {
  const avgLatency = (tool.endpoints.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / Math.max(1, tool.endpoints.length)).toFixed(0);
  const avgThroughput = (tool.endpoints.reduce((acc, curr) => acc + curr.throughputRps, 0) / Math.max(1, tool.endpoints.length)).toFixed(0);

  return (
    <div className="space-y-12 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Pricing Section */}
      <section id="pricing" className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">$ Effective Pricing</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Realized average cost taking into account response caching and high-concurrency discounts over the past 30 days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Weighted Avg Input Price</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">$0.0012 <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">/ 1k calls</span></div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Weighted Avg Output Price</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">$0.0045 <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">/ 1k calls</span></div>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section id="performance" className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        <div id="uptime">
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">⚡ Performance &amp; Latency</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Global throughput and round-trip execution metrics monitored across edge providers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Avg Throughput</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{avgThroughput} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">req/sec</span></div>
            <span className="text-[11px] text-lime-600 dark:text-lime-400 font-mono">P50 across top providers</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Avg Round-Trip Latency</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{avgLatency} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">ms</span></div>
            <span className="text-[11px] text-lime-600 dark:text-lime-400 font-mono">Fastest edge connection</span>
          </div>
        </div>
      </section>
    </div>
  );
}
