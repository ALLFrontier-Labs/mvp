import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Wallet, ExternalLink, ShieldCheck, Zap, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface Tier {
  credits: string;
  price: string;
  fee: string;
  net: string;
}

const TIERS: Tier[] = [
  { credits: '10', price: '$11.05', fee: '$1.05', net: '$10.00' },
  { credits: '25', price: '$26.84', fee: '$1.84', net: '$25.00' },
  { credits: '50', price: '$53.16', fee: '$3.16', net: '$50.00' },
  { credits: '100', price: '$105.79', fee: '$5.79', net: '$100.00' },
];

export const Billing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    api.getUsage()
      .then((data) => setBalance(data.balance_usd))
      .catch(() => {});
  }, []);

  const handleTopup = async (amount: string) => {
    setLoadingCheckout(amount);
    setCheckoutError(null);
    try {
      const res = await api.getCheckoutUrl(amount);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      setCheckoutError(err.message || 'LemonSqueezy variants not yet configured in environment variables.');
    } finally {
      setLoadingCheckout(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Prepaid Wallet & Zero-Margin Billing</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Top up your wallet. Every call debits exact wholesale provider price.
          </p>
        </div>

        {/* Current Balance */}
        <div className="flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase">Available Balance</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {balance !== null ? `$${balance.toFixed(4)}` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {checkoutError && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-300 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">LemonSqueezy Checkout Pending Configuration</strong>
            {checkoutError}
          </div>
        </div>
      )}

      {/* Formula & Transparency Explanation */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
        <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Margin Fee Formula</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          LemonSqueezy charges a payment processing fee of <code className="text-emerald-300">5% + $0.50</code>. 
          LiteDaemon calibrates the checkout price so that after processing fees are paid, <strong>exactly 100% of your credit amount</strong> lands in your prepaid wallet. LiteDaemon keeps $0.00.
        </p>

        <div className="p-3 rounded-xl bg-[#0a0d14] border border-slate-800 font-mono text-xs text-slate-400">
          <code>checkout_price = (credit_amount + $0.50) / 0.95</code>
        </div>
      </div>

      {/* 4 Fixed Tiers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Select Top-Up Amount</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.credits}
              className="rounded-2xl glass-card border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Tier</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tier.net} Credits
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold font-mono text-white group-hover:text-emerald-400 transition-colors">
                    ${tier.credits}.00
                  </div>
                  <span className="text-xs text-slate-400">Wallet Credit</span>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Checkout Price:</span>
                    <span className="text-white font-semibold">{tier.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>LemonSqueezy Fee:</span>
                    <span className="text-slate-400">{tier.fee}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800/60">
                    <span>Net Wallet Credit:</span>
                    <span>{tier.net}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTopup(tier.credits)}
                disabled={loadingCheckout === tier.credits}
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {loadingCheckout === tier.credits ? (
                  <span>Generating Link...</span>
                ) : (
                  <>
                    <span>Top Up ${tier.credits}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
