import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wrench, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export interface RequestAdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestAdapterModal: React.FC<RequestAdapterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [modalTab, setModalTab] = useState<'request' | 'proxy'>('request');
  const [formState, setFormState] = useState({
    name: '',
    url: '',
    category: '/v1/scrape',
    useCase: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      if (modalTab === 'request') {
        setSubmittedMessage('Adapter request submitted! Our engineering team will review it shortly.');
      } else {
        setSubmittedMessage(`Custom REST Proxy for "${formState.name || 'Custom Proxy'}" registered successfully.`);
      }

      setTimeout(() => {
        setSubmittedMessage(null);
        setFormState({ name: '', url: '', category: '/v1/scrape', useCase: '' });
        onClose();
      }, 2500);
    }, 1000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl text-xs relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-lime-500" /> Custom Adapter Workflow
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Request a new native provider integration or register an instant REST proxy.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono">
          <button
            type="button"
            onClick={() => setModalTab('request')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              modalTab === 'request'
                ? 'bg-lime-400 text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            + Request Provider Adapter
          </button>
          <button
            type="button"
            onClick={() => setModalTab('proxy')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              modalTab === 'proxy'
                ? 'bg-lime-400 text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            ⚡ Register Custom Proxy
          </button>
        </div>

        {/* Submission Feedback Banner */}
        {submittedMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Success!
            </div>
            <p>{submittedMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                {modalTab === 'request' ? 'Provider / API Tool Name' : 'Custom Proxy Service Name'}
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={e => setFormState({ ...formState, name: e.target.value })}
                placeholder={modalTab === 'request' ? 'e.g. Custom Unlisted Scraper, Cohere Web Search' : 'e.g. Internal Microservice Proxy'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Documentation / API URL
                </label>
                <input
                  type="url"
                  required
                  value={formState.url}
                  onChange={e => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://provider.com/docs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Target Endpoint Category
                </label>
                <select
                  value={formState.category}
                  onChange={e => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none font-mono text-xs"
                >
                  <option value="/v1/scrape">/v1/scrape</option>
                  <option value="/v1/search">/v1/search</option>
                  <option value="/v1/browser">/v1/browser</option>
                  <option value="/v1/execute">/v1/execute</option>
                  <option value="/v1/document">/v1/document</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                Use Case Details / Header Specs
              </label>
              <textarea
                rows={3}
                value={formState.useCase}
                onChange={e => setFormState({ ...formState, useCase: e.target.value })}
                placeholder="Describe your execution parameters, expected output format, or custom auth requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 font-mono">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Workflow</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>,
    document.body
  );
};
