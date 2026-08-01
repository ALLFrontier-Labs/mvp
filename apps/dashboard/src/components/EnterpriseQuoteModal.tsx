import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Mail, CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react';

interface EnterpriseQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseQuoteModal: React.FC<EnterpriseQuoteModalProps> = ({ isOpen, onClose }) => {
  const [workEmail, setWorkEmail]       = useState('');
  const [companyName, setCompanyName]   = useState('');
  const [volume, setVolume]             = useState('< 500k');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [emailError, setEmailError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setWorkEmail('');
      setCompanyName('');
      setVolume('< 500k');
      setRequirements('');
      setIsSubmitted(false);
      setEmailError(null);
      return;
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!workEmail || !workEmail.includes('@')) {
      setEmailError('Please enter a valid work email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans selection:bg-lime-400 selection:text-zinc-950">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-lime-500" />
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Contact Enterprise Sales</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Enterprise Request Submitted!</h4>
              <p className="text-xs font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Thanks! A dedicated solutions architect will reach out to <strong>{workEmail}</strong> within 4 business hours.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-md"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            
            {/* Work Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Work Email Address *</label>
              <input
                type="email"
                required
                value={workEmail}
                onChange={(e) => { setWorkEmail(e.target.value); setEmailError(null); }}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
              />
              {emailError && <p className="text-rose-500 text-[11px] font-semibold">{emailError}</p>}
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp AI Labs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
              />
            </div>

            {/* Estimated Monthly Volume Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Est. Monthly Request Volume</label>
              <select
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none cursor-pointer"
              >
                <option value="< 500k">&lt; 500k Requests / mo</option>
                <option value="500k - 5M">500k – 5M Requests / mo</option>
                <option value="5M - 50M">5M – 50M Requests / mo</option>
                <option value="50M+">50M+ Enterprise Scale</option>
              </select>
            </div>

            {/* Custom Requirements Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Custom Requirements / Adapters</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Dedicated proxy edge routers, custom SLAs, HSM key storage, or proprietary adapter needs..."
                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Submitting Enterprise Request…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-zinc-950" />
                    <span>Submit Enterprise Request</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
