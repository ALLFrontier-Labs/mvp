import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wallet, ArrowRight, Zap, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, Info, ShieldCheck, Check
} from 'lucide-react';
import { api } from '../lib/api';

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 200];
const LS_FEE_RATE   = 0.055; // 5.5%
const LS_FEE_FIXED  = 0.50;  // $0.50
const MIN           = 5;
const MAX           = 999;

// What user pays to the gateway so wallet gets exactly creditAmount
function checkoutPrice(credit: number) {
  return Math.ceil(((credit + LS_FEE_FIXED) / (1 - LS_FEE_RATE)) * 100) / 100;
}

// Fee amount
function feeAmount(credit: number) {
  return +(checkoutPrice(credit) - credit).toFixed(2);
}

export const Billing: React.FC = () => {
  const [searchParams]         = useSearchParams();
  const successParam           = searchParams.get('success');

  const [credit, setCredit]    = useState<string>('10');
  const [loading, setLoading]  = useState(false);
  const [balance, setBalance]  = useState<number | null>(null);
  const [balLoad, setBalLoad]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  // Auto-recharge state
  const [autoRecharge, setAutoRecharge]           = useState(false);
  const [rechargeThreshold, setRechargeThreshold] = useState('5.00');
  const [rechargeAmount, setRechargeAmount]       = useState('10.00');

  const creditNum  = parseFloat(credit) || 0;
  const payNum     = creditNum >= MIN ? checkoutPrice(creditNum) : 0;
  const fee        = creditNum >= MIN ? feeAmount(creditNum)     : 0;
  const isValid    = creditNum >= MIN && creditNum <= MAX;

  useEffect(() => {
    api.getMe()
      .then(d => setBalance(d.balance_usd))
      .catch(() => setBalance(null))
      .finally(() => setBalLoad(false));
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6 selection:bg-emerald-500 selection:text-slate-950">

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Add Funds
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Prepaid wallet — used for BYOK tool routing fees, multi-key failover handling, and platform usage.
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-[10px] font-mono uppercase text-slate-500">Current Balance</p>
          {balLoad
            ? <div className="w-20 h-7 rounded bg-slate-800 animate-pulse mt-1" />
            : <p className="text-2xl font-extrabold font-mono text-emerald-400">${balance?.toFixed(4) ?? '—'}</p>
          }
        </div>
      </div>

      {/* Main top-up card */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-6 shadow-xl">

        {/* Amount input */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Wallet Credit Amount
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
          <p className="text-[10px] text-slate-600 font-mono">Min $5 · Max $999 per transaction</p>
        </div>

        {/* Quick amount pills */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => setCredit(String(amt))}
              className={`px-4 py-1.5 rounded-lg font-mono text-sm font-semibold border transition-all ${
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
          <div className={`rounded-xl p-4 space-y-2 border text-sm font-mono ${
            isValid
              ? 'bg-emerald-950/20 border-emerald-500/20'
              : 'bg-rose-950/30 border-rose-500/20'
          }`}>
            <div className="flex justify-between text-slate-300">
              <span>Wallet credit amount</span>
              <span className="text-white font-bold">${creditNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-500" />
                Platform & Deposit Fee (5.5% + $0.50)
              </span>
              <span>+${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
              <span className={isValid ? 'text-emerald-300' : 'text-rose-400'}>Total to pay</span>
              <span className={`text-lg ${isValid ? 'text-emerald-300' : 'text-rose-400'}`}>
                ${isValid ? payNum.toFixed(2) : '—'}
              </span>
            </div>
            {!isValid && (
              <p className="text-rose-400 text-xs">
                {creditNum < MIN ? `Minimum deposit is $${MIN}` : `Maximum deposit is $${MAX}`}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleTopUp}
          disabled={!isValid || loading}
          className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating checkout…</>
            : <><Zap className="w-5 h-5" /> Add ${isValid ? payNum.toFixed(2) : '—'} → Get ${isValid ? creditNum.toFixed(2) : '—'} in wallet <ArrowRight className="w-4 h-4" /></>
          }
        </button>

        <p className="text-center text-xs text-slate-600">
          Secured by LemonSqueezy · Visa / Mastercard / AMEX / PayPal accepted
        </p>
      </div>

      {/* Auto-recharge card */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-teal-400" />
              Auto Recharge
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Automatically top up when balance drops below threshold</p>
          </div>
          {/* Toggle */}
          <button
            onClick={() => setAutoRecharge(!autoRecharge)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoRecharge ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoRecharge ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {autoRecharge && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">Trigger Threshold</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number" value={rechargeThreshold} min="1" max="100"
                  onChange={e => setRechargeThreshold(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">Auto-Topup Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number" value={rechargeAmount} min="5" max="999"
                  onChange={e => setRechargeAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="col-span-2">
              <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-3 text-xs text-teal-300 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Auto-recharge will automatically trigger when your wallet drops below ${rechargeThreshold || '5.00'}.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BYOK Gateway Pricing Tier Explainer Card */}
      <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">BYOK Gateway Usage</h3>
        </div>
        <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-mono">
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>First <strong className="text-white font-bold">1,000,000 monthly tool requests</strong> are 100% FREE.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white font-bold">5% routing fee</strong> applied on volume past 1M requests/month, auto-deducted from wallet balance.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white font-bold">Zero per-tool markup</strong> — you pay your tool providers directly with your BYOK keys.</span>
          </div>
        </div>
      </div>

    </div>
  );
};
