import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle, ShieldAlert, CreditCard, RefreshCw, ArrowRight } from 'lucide-react';

export interface UsageBannerProps {
  monthlyCallCount?: number;
  balanceUsd?: number;
  billingPeriodStart?: string | Date;
  onTopUpClick?: () => void;
}

export const UsageBanner: React.FC<UsageBannerProps> = ({
  monthlyCallCount = 0,
  balanceUsd = 0,
  billingPeriodStart,
  onTopUpClick,
}) => {
  const cap = 100;
  const used = Math.max(0, monthlyCallCount);
  const percentage = Math.min(100, Math.round((used / cap) * 100));

  // Determine State
  let fillClass = 'bg-lime-400';
  let badgeText = 'Free Allowance Active';
  let badgeClass = 'bg-lime-500/10 text-lime-400 border-lime-500/30';

  if (used >= 80 && used < 100) {
    fillClass = 'bg-amber-400';
    badgeText = 'Approaching 100 Free Calls Cap';
    badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (used >= 100) {
    fillClass = 'bg-emerald-400';
    badgeText = 'Pay-As-You-Go Billed (+5% Markup)';
    badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  // Calculate reset date (start + 30 days)
  const startDate = billingPeriodStart ? new Date(billingPeriodStart) : new Date();
  const resetDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isBalanceRequired = used >= 100 && balanceUsd <= 0;

  return (
    <div className="w-full space-y-3">
      {/* Insufficient Balance Action Banner */}
      {isBalanceRequired && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-300">Payment Method Required</p>
              <p className="text-rose-400/80 mt-0.5">
                Payment method required to continue making API calls past 100 free allowance. Requests without balance will return HTTP 402.
              </p>
            </div>
          </div>
          {onTopUpClick ? (
            <button
              onClick={onTopUpClick}
              className="shrink-0 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <CreditCard className="w-3.5 h-3.5" /> Top Up Balance <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <Link
              to="/billing"
              className="shrink-0 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <CreditCard className="w-3.5 h-3.5" /> Add Funds <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Main Progress Card */}
      <div
        className="rounded-2xl p-5 border space-y-4 shadow-xl transition-all"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Monthly Free Call Usage
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${badgeClass}`}>
                {badgeText}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Billing cycle reset: <strong className="font-mono text-zinc-300">{formatDate(resetDate)}</strong> (30-day auto-reset)
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xl font-extrabold font-mono" style={{ color: used >= 100 ? '#4ade80' : 'var(--text-primary)' }}>
              {used}
            </span>
            <span className="text-sm font-mono text-zinc-500"> / {cap} Free Calls</span>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full overflow-hidden bg-zinc-800/80 p-0.5 border border-zinc-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${fillClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>0 calls</span>
            <span>{percentage}% of 100 free cap</span>
            <span>100 calls (Pass-Through + 5% Markup)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
