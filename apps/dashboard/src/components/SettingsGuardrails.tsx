import React, { useState } from 'react';
import { Sliders, Shield, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SettingsGuardrails: React.FC = () => {
  const [budgetCap, setBudgetCap]     = useState('100.00');
  const [autoKill, setAutoKill]       = useState(true);
  const [allowedIps, setAllowedIps]   = useState('192.168.1.1\n10.0.0.0/24');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGuardrails = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-6 font-sans">
      
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
        <Shield className="w-4 h-4 text-lime-500" />
        <span>Enterprise Security Guardrails &amp; IP Whitelisting</span>
      </div>

      <form onSubmit={handleSaveGuardrails} className="space-y-5 font-mono text-xs">
        
        {/* Hard Budget Cap */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Monthly Spending Limit ($ USD)</label>
          <input
            type="text"
            value={budgetCap}
            onChange={e => setBudgetCap(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
          />
        </div>

        {/* Auto-Kill Switch */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Hard Auto-Kill Switch</span>
            <button
              type="button"
              onClick={() => setAutoKill(!autoKill)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${autoKill ? 'bg-lime-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${autoKill ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
            Block all gateway requests automatically if monthly spending cap is reached.
          </p>
        </div>

        {/* IP Whitelisting Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Allowed IP Addresses / CIDR Blocks</label>
          <textarea
            rows={3}
            value={allowedIps}
            onChange={e => setAllowedIps(e.target.value)}
            placeholder="192.168.1.1, 10.0.0.0/24"
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs focus:outline-none"
          />
          <p className="text-[10px] text-zinc-400 font-sans">
            When configured, requests using your Master API Key will only be accepted from these IP addresses.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold shadow-md transition-all cursor-pointer"
          >
            Save Security Policy
          </button>

          {savedSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Security policy updated!
            </span>
          )}
        </div>

      </form>

    </div>
  );
};
