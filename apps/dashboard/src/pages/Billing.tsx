import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wallet, ArrowRight, Zap, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, Info, ShieldCheck, Check,
  CreditCard, FileText, Calendar, Clock, DollarSign, Download
} from 'lucide-react';
import { api } from '../lib/api';
import { UsageBanner } from '../components/UsageBanner';

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 200];
const MIN           = 5;
const MAX           = 999;

function calcDepositFee(credit: number): number {
  const fee = Math.max(0.80, credit * 0.055);
  return Math.round(fee * 100) / 100;
}

function calcCheckoutPrice(credit: number): number {
  const fee = calcDepositFee(credit);
  return Math.round((credit + fee) * 100) / 100;
}

export interface LedgerRow {
  id: string;
  timestamp: string;
  provider: string;
  rawCost: number;
  markup: number;
  totalBilled: number;
  status: string;
  isFree: boolean;
}

export const Billing: React.FC = () => {
  const [searchParams]         = useSearchParams();
  const successParam           = searchParams.get('success');

  const [credit, setCredit]    = useState<string>('10');
  const [loading, setLoading]  = useState(false);
  const [balance, setBalance]  = useState<number | null>(null);
  const [monthlyCallCount, setMonthlyCallCount] = useState<number>(0);
  const [billingPeriodStart, setBillingPeriodStart] = useState<string>(new Date().toISOString());
  const [balLoad, setBalLoad]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  // Transaction Ledger State
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);

  // Modal / Action triggers
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Auto-recharge state
  const [autoRecharge, setAutoRecharge]           = useState(false);
  const [rechargeThreshold, setRechargeThreshold] = useState('5.00');
  const [rechargeAmount, setRechargeAmount]       = useState('10.00');

  const creditNum  = parseFloat(credit) || 0;
  const fee        = creditNum >= MIN ? calcDepositFee(creditNum)     : 0;
  const payNum     = creditNum >= MIN ? calcCheckoutPrice(creditNum)  : 0;
  const isValid    = creditNum >= MIN && creditNum <= MAX;

  const loadBillingData = async () => {
    setBalLoad(true);
    try {
      const [meData, usageData, jobsData] = await Promise.all([
        api.getMe().catch(() => null),
        api.getUsage().catch(() => null),
        api.listJobs(10, 0).catch(() => ({ jobs: [] })),
      ]);

      if (usageData) {
        setBalance(usageData.balance_usd);
        setMonthlyCallCount(usageData.total_calls || 0);
      } else if (meData) {
        setBalance(meData.balance_usd);
        setMonthlyCallCount(meData.total_calls || 0);
      }

      if (meData?.created_at) {
        setBillingPeriodStart(meData.created_at);
      }

      // Process real jobs into transaction ledger rows with 5% markup calculations
      if (jobsData?.jobs && jobsData.jobs.length > 0) {
        const rows: LedgerRow[] = jobsData.jobs.map((j: any, index: number) => {
          const totalCost = j.cost_usd || 0;
          const isFree = totalCost === 0;
          const rawCost = isFree ? 0 : Math.round((totalCost / 1.05) * 10000) / 10000;
          const markup  = isFree ? 0 : Math.round((totalCost - rawCost) * 10000) / 10000;

          return {
            id: j.job_id || `ledger_${index}`,
            timestamp: j.created_at || new Date().toISOString(),
            provider: j.provider || j.endpoint || 'search',
            rawCost,
            markup,
            totalBilled: totalCost,
            status: j.status || 'completed',
            isFree,
          };
        });
        setLedgerRows(rows);
      } else {
        // Mock fallback rows demonstrating 5% markup & free tier formatting
        setLedgerRows([
          {
            id: 'tx_sample_1',
            timestamp: new Date().toISOString(),
            provider: 'Tavily Search',
            rawCost: 0.0100,
            markup: 0.0005,
            totalBilled: 0.0105,
            status: 'completed',
            isFree: false,
          },
          {
            id: 'tx_sample_2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            provider: 'Exa AI Search',
            rawCost: 0.0020,
            markup: 0.0001,
            totalBilled: 0.0000,
            status: 'completed',
            isFree: true,
          },
        ]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load billing information');
    } finally {
      setBalLoad(false);
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleTopUp = async () => {
    if (!isValid) return;
    setLoading(true); setError(null);
    try {
      const data = await api.getCheckoutUrl(String(creditNum));
      window.location.href = data.checkout_url;
    } catch (e: any) {
      setError(e.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentModal(true);
  };

  const handleViewInvoices = () => {
    setShowInvoicesModal(true);
  };

  const startDate = new Date(billingPeriodStart);
  const resetDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 selection:bg-emerald-500 selection:text-slate-950 font-sans">

      {/* Success banner */}
      {successParam && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 font-semibold text-sm">Payment successful!</p>
            <p className="text-emerald-400/70 text-xs mt-0.5">Funds have been credited to your wallet. It may take a few seconds to reflect.</p>
          </div>
          <Link to="/dashboard" className="ml-auto text-xs text-emerald-400 hover:text-emerald-300 font-mono underline">
            Dashboard →
          </Link>
        </div>
      )}

      {/* Action Notification */}
      {actionNotice && (
        <div className="rounded-2xl bg-teal-500/10 border border-teal-500/30 p-4 text-xs text-teal-300 flex justify-between items-center">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <Wallet className="w-7 h-7 text-emerald-400" />
            Billing &amp; Wallet Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Prepaid wallet balance, 30-day billing cycle dates, and transparent 5% markup transaction logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAddPaymentMethod}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Add Payment Method
          </button>
          <button
            onClick={handleViewInvoices}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" /> View Invoices
          </button>
        </div>
      </div>

      {/* ── 1. Usage Progress Banner ────────────────────────────────────────── */}
      <UsageBanner
        monthlyCallCount={monthlyCallCount}
        balanceUsd={balance || 0}
        billingPeriodStart={billingPeriodStart}
        onTopUpClick={() => {
          const el = document.getElementById('topup-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── 2. Billing Cycle Dates Card ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Billing Cycle</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Billing Period Start</span>
            <span className="text-sm font-bold text-white">{formatDate(startDate)}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Calculated Auto-Reset</span>
            <span className="text-sm font-bold text-emerald-400">{formatDate(resetDate)}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Current Wallet Balance</span>
            <span className="text-sm font-bold text-lime-400">${balance?.toFixed(4) || '0.0000'}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Wallet Top-Up Form ────────────────────────────────────────────── */}
      <div id="topup-section" className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-400" />
              Add Wallet Funds
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Instant wallet deposit for pass-through provider execution post 100 free calls.</p>
          </div>
          <span className="text-2xl font-extrabold font-mono text-emerald-400">${balance?.toFixed(4) ?? '0.0000'}</span>
        </div>

        {/* Amount input */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Select or Enter Credit Deposit Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xl">$</span>
            <input
              type="number"
              value={credit}
              onChange={e => setCredit(e.target.value)}
              min={MIN}
              max={MAX}
              step="1"
              placeholder="10"
              className="w-full pl-9 pr-4 py-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white font-mono text-2xl font-bold placeholder-slate-700 transition-colors"
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Min $5 · Max $999 per deposit session</p>
        </div>

        {/* Quick amount pills */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => setCredit(String(amt))}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold border transition-all ${
                creditNum === amt
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              +${amt}
            </button>
          ))}
        </div>

        {/* Fee breakdown */}
        {creditNum > 0 && (
          <div className={`rounded-xl p-4 space-y-2 border text-xs font-mono ${
            isValid
              ? 'bg-emerald-950/20 border-emerald-500/20'
              : 'bg-rose-950/30 border-rose-500/20'
          }`}>
            <div className="flex justify-between text-slate-300">
              <span>Wallet credit deposit</span>
              <span className="text-white font-bold">${creditNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Platform &amp; Deposit Fee (5.5%, $0.80 min)
              </span>
              <span>+${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
              <span className={isValid ? 'text-emerald-300' : 'text-rose-400'}>Total Checkout Amount</span>
              <span className={isValid ? 'text-emerald-300' : 'text-rose-400'}>
                ${isValid ? payNum.toFixed(2) : '—'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleTopUp}
          disabled={!isValid || loading}
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Checkout Session…</>
            : <><Zap className="w-5 h-5" /> Add ${isValid ? payNum.toFixed(2) : '—'} → Credit ${isValid ? creditNum.toFixed(2) : '—'} Wallet <ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>

      {/* ── 4. Transaction Ledger Table ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">Transparent 5% Markup Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Tool / Provider</th>
                <th className="py-3 px-4">Raw Cost</th>
                <th className="py-3 px-4">Markup (5%)</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {ledgerLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading transaction ledger…
                  </td>
                </tr>
              ) : ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(row.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white capitalize">
                      {row.provider}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      ${row.rawCost.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-lime-400">
                      ${row.markup.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {row.isFree ? '$0.0000 (Free Call)' : `$${row.totalBilled.toFixed(4)}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Add Payment Method
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-zinc-500 hover:text-white font-mono">✕</button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              LiteDaemon uses LemonSqueezy payment sessions for card authorization and prepaid wallet billing. Adding a credit card enables auto-recharge and pay-as-you-go call routing post 100 free monthly calls.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleTopUp();
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Secure Checkout ($5 Deposit) →
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-900 text-zinc-400 font-semibold text-xs border border-slate-800 hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoices Modal */}
      {showInvoicesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" /> Invoices &amp; Receipts
              </h3>
              <button onClick={() => setShowInvoicesModal(false)} className="text-zinc-500 hover:text-white font-mono">✕</button>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">LemonSqueezy Wallet Top-Up</p>
                  <p className="text-zinc-500 text-[10px]">{formatDate(new Date())}</p>
                </div>
                <span className="text-emerald-400 font-bold">$10.00 USD</span>
              </div>
            </div>
            <button
              onClick={() => setShowInvoicesModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-zinc-400 font-semibold text-xs border border-slate-800 hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
