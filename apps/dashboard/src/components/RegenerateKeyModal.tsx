import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, X, AlertTriangle, CheckCircle2, Copy, Check, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { api, setStoredApiKey } from '../lib/api';

interface RegenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyRegenerated: (newKey: string) => void;
}

export const RegenerateKeyModal: React.FC<RegenerateKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyRegenerated,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [copiedNewKey, setCopiedNewKey]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmInput('');
      setNewKeyGenerated(null);
      setCopiedNewKey(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim() === 'REGENERATE';

  const handleExecuteRegenerate = async () => {
    if (!isConfirmed) return;
    setIsGenerating(true);
    setError(null);

    try {
      // Call the REAL backend endpoint — server generates the key,
      // deactivates all old keys, and busts the Redis auth cache.
      const result = await api.regenerateKey();

      // Store the new server-generated key in localStorage
      setStoredApiKey(result.api_key);
      setNewKeyGenerated(result.api_key);
      onKeyRegenerated(result.api_key);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate API key. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNewKey = () => {
    if (!newKeyGenerated) return;
    navigator.clipboard.writeText(newKeyGenerated);
    setCopiedNewKey(true);
    setTimeout(() => setCopiedNewKey(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans selection:bg-lime-400 selection:text-zinc-950">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Regenerate Master Gateway Key?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {newKeyGenerated ? (
          /* Step 2: New Key Display (One Time) */
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Master API Key Regenerated!</span>
              </div>
              <p className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Make sure to copy your new key now. You won't be able to see it again! All previous keys have been permanently deactivated.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">New Bearer Token:</label>
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <code className="flex-1 text-xs text-lime-400 font-mono break-all">{newKeyGenerated}</code>
                <button
                  onClick={handleCopyNewKey}
                  className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold transition-all flex items-center gap-1"
                >
                  {copiedNewKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNewKey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800"
              >
                Done &amp; Close
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Confirmation Safety Warning */
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" /> Destruction Warning
              </span>
              <p className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This action will immediately invalidate your current Master API Key. Any active integrations using your old key will stop working until updated.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                Type <span className="text-rose-500 font-extrabold">REGENERATE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="REGENERATE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteRegenerate}
                disabled={!isConfirmed || isGenerating}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md disabled:opacity-40 transition-all"
              >
                {isGenerating ? 'Regenerating Key…' : 'Confirm & Regenerate'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
