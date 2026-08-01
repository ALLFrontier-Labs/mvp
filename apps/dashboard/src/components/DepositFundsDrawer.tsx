import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, CreditCard, Check, ShieldCheck, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface DepositFundsDrawerProps {
  isOpen: boolean;
  currentBalance: number;
  onClose: () => void;
  onDepositSuccess: (addedAmount: number) => void;
}

export const DepositFundsDrawer: React.FC<DepositFundsDrawerProps> = ({
  isOpen,
  currentBalance,
  onClose,
  onDepositSuccess,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(50);
  const [customAmount, setCustomAmount]     = useState<string>('');
  const [autoRecharge, setAutoRecharge]     = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod]   = useState<'card' | 'stripe'>('card');
  const [isProcessing, setIsProcessing]     = useState<boolean>(false);
  const [depositError, setDepositError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const depositAmount = customAmount ? parseFloat(customAmount) : selectedPreset;

  const handleConfirmDeposit = () => {
    setDepositError(null);
    if (isNaN(depositAmount) || depositAmount < 5) {
      setDepositError('Minimum deposit amount is $5.00');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(depositAmount);
      onClose();
    }, 1200);
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden font-sans selection:bg-lime-400 selection:text-zinc-950">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[9999] h-screen w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-lime-500" />
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Deposit Prepaid Routing Funds</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Balance Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Current Gateway Balance:</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${currentBalance.toFixed(4)}</span>
          </div>

          {/* Preset Amount Pills */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Select Deposit Amount:</label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 25, 50, 100, 250].map((amt) => {
                const isSelected = selectedPreset === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedPreset(amt); setCustomAmount(''); setDepositError(null); }}
                    className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-lime-400 text-zinc-950 border-lime-400 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-1 font-mono text-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Or Custom Amount ($ USD):</label>
            <input
              type="number"
              min={5}
              placeholder="e.g. 75.00"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setDepositError(null); }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
            />
            {depositError && <p className="text-rose-500 text-[11px] font-semibold">{depositError}</p>}
          </div>

          {/* Auto-Recharge Switch */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Auto-Recharge Guardrail</span>
              <button
                type="button"
                onClick={() => setAutoRecharge(!autoRecharge)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${autoRecharge ? 'bg-lime-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${autoRecharge ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              Automatically deposit $25.00 when balance drops below $2.00 to prevent BYOK API disruptions.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Payment Method:</label>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-lime-500" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Visa ending in •••• 4242</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Stripe Default</span>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Total Deposit:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">${(depositAmount || 0).toFixed(2)} USD</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmDeposit}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Processing Payment via Stripe…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-zinc-950" />
                <span>Confirm &amp; Add ${(depositAmount || 0).toFixed(2)} Funds</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
