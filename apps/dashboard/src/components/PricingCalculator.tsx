import React, { useState } from 'react';
import { Calculator, Zap, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';

export const PricingCalculator: React.FC = () => {
  const [requests, setRequests] = useState<number>(250000);

  // Traditional wrapper markup calculation (~$0.005/request average)
  const traditionalCost = (requests * 0.005);
  // LiteDaemon BYOK micro-fee (~5% of direct provider API cost, est. $0.0017/request BYOK)
  const liteDaemonFee   = (requests * 0.00175);
  // Savings
  const savings = Math.max(0, traditionalCost - liteDaemonFee);
  const savingsPercentage = Math.round((savings / traditionalCost) * 100);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-xl space-y-8 font-sans max-w-4xl mx-auto selection:bg-lime-400 selection:text-zinc-950">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Interactive BYOK Savings Estimator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Calculate Your Monthly BYOK Cost Savings
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Compare traditional 3rd-party API re-seller markups with LiteDaemon's 5% micro-routing overhead.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-extrabold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <span>Save ~{savingsPercentage}% Monthly</span>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase">Monthly Request Volume:</span>
          <span className="text-lg font-extrabold text-lime-600 dark:text-lime-400">
            {formatNumber(requests)} Calls / Month
          </span>
        </div>

        <input
          type="range"
          min={10000}
          max={5000000}
          step={10000}
          value={requests}
          onChange={(e) => setRequests(Number(e.target.value))}
          className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
        />

        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>10k Requests</span>
          <span>1M Requests</span>
          <span>5M Requests</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        
        {/* Traditional Re-Seller Box */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold uppercase">
            <span>Traditional API Re-Seller</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px]">High Markup</span>
          </div>

          <div className="text-3xl font-extrabold text-zinc-700 dark:text-zinc-300">
            ${formatNumber(Math.round(traditionalCost))} <span className="text-xs font-normal text-zinc-400">/ mo</span>
          </div>

          <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
            Proprietary API wrappers bundle high 40-70% margins on top of upstream Tavily/Firecrawl/E2B rates.
          </p>
        </div>

        {/* LiteDaemon BYOK Box */}
        <div className="p-6 rounded-2xl bg-lime-500/10 dark:bg-lime-500/10 border border-lime-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-lime-600 dark:text-lime-400 text-[11px] font-bold uppercase">
            <span>LiteDaemon BYOK Gateway</span>
            <span className="px-2 py-0.5 rounded bg-lime-400 text-zinc-950 text-[10px] font-extrabold">Flat 5% Micro-Fee</span>
          </div>

          <div className="text-3xl font-extrabold text-lime-600 dark:text-lime-400">
            ${formatNumber(Math.round(liteDaemonFee))} <span className="text-xs font-normal text-zinc-500">/ mo</span>
          </div>

          <div className="space-y-1 font-sans text-xs text-zinc-700 dark:text-zinc-300">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Est. Monthly Savings: ${formatNumber(Math.round(savings))} USD
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Route directly using your encrypted provider keys with 0% margin markup.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
