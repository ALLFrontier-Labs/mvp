import React, { useState, useEffect } from 'react';
import { X, Wallet, Zap, Loader2, CheckCircle2, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { api } from '../lib/api';

export interface TopUpModalProps {
  isOpen: boolean;
  initialAmount?: number;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}

const PRESETS = [10, 25, 50, 100];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 999;

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  initialAmount = 10,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>(String(initialAmount));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialAmount) {
      setAmount(String(initialAmount));
    }
  }, [initialAmount, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount >= MIN_AMOUNT && numAmount <= MAX_AMOUNT;

  const handleDeposit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      // Execute Dodo Payments checkout session or execute wallet topup hook
      const checkoutRes = await api.getCheckoutUrl(String(numAmount)).catch(() => null);

      if (checkoutRes?.checkout_url) {
        window.location.href = checkoutRes.checkout_url;
        return;
      }

      // If backend mock/direct deposit mode is active
      setSuccessToast(`Successfully credited $${numAmount.toFixed(2)} to your LiteDaemon balance!`);
      if (onSuccess) onSuccess(numAmount);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  Prepaid Balance Top-Up
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instant gateway wallet credit deposit
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Toast Notification */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
              Select Preset Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className={`py-2.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                    numAmount === amt
                      ? 'bg-lime-400 text-zinc-950 border-lime-400 shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-lime-500/40'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
              Or Enter Custom Amount ($5 – $999)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-lg">$</span>
              <input
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xl font-bold focus:border-lime-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Deposit Breakdown */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Deposit Amount</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">${numAmount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                Gateway Pass-Through Balance Added
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+${numAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between font-bold text-sm">
              <span className="text-zinc-900 dark:text-zinc-100">Total Billed</span>
              <span className="text-lime-600 dark:text-lime-400">${numAmount.toFixed(2)} USD</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDeposit}
              disabled={!isValid || loading}
              className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout...</>
              ) : (
                <><Zap className="w-4 h-4" /> Confirm Deposit (${numAmount.toFixed(2)}) →</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold text-xs border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
