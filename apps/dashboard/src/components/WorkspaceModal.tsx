import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Plus, Check, ShieldCheck, Wallet, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export interface WorkspaceItem {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  calls: string;
  balance: string;
  keysCount: number;
  billingType: 'Personal Prepaid' | 'Shared Team Wallet';
}

const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'ws-personal',
    name: 'Personal Workspace',
    role: 'Owner',
    calls: '10 Metered Calls',
    balance: '$9.9500 Balance',
    keysCount: 6,
    billingType: 'Personal Prepaid',
  },
  {
    id: 'ws-acme',
    name: 'Acme Corp AI Engineering',
    role: 'Admin',
    calls: '142,800 Calls/mo',
    balance: '$250.00 Balance',
    keysCount: 12,
    billingType: 'Shared Team Wallet',
  },
];

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspaceId: string;
  onSelectWorkspace: (ws: WorkspaceItem) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activeWorkspaceId,
  onSelectWorkspace,
}) => {
  const [workspaces, setWorkspaces]       = useState<WorkspaceItem[]>(DEFAULT_WORKSPACES);
  const [isCreating, setIsCreating]       = useState(false);
  const [newName, setNewName]             = useState('');
  const [newBilling, setNewBilling]       = useState<'Personal Prepaid' | 'Shared Team Wallet'>('Shared Team Wallet');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setNewName('');
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

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newWs: WorkspaceItem = {
        id: `ws-${Date.now()}`,
        name: newName.trim(),
        role: 'Owner',
        calls: '0 Calls',
        balance: '$20.00 Balance',
        keysCount: 1,
        billingType: newBilling,
      };

      setWorkspaces((prev) => [...prev, newWs]);
      onSelectWorkspace(newWs);
      setIsSubmitting(false);
      setIsCreating(false);
      setNewName('');
      onClose();
    }, 800);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm font-sans selection:bg-lime-400 selection:text-zinc-950">
      
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {isCreating ? 'Create New Workspace' : 'Switch Workspace'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                {isCreating
                  ? 'Set up a team environment for shared BYOK keys & team billing.'
                  : 'Select an active workspace environment or create a new team vault.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Views Container */}
        {isCreating ? (
          /* Inline Creation Form */
          <form onSubmit={handleCreateWorkspace} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Workspace Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Production AI Agents"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Billing Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewBilling('Shared Team Wallet')}
                  className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                    newBilling === 'Shared Team Wallet'
                      ? 'border-lime-400 bg-lime-500/10 text-zinc-900 dark:text-zinc-100 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-lime-600 dark:text-lime-400 font-extrabold text-xs">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Shared Team Wallet</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block leading-tight font-sans">
                    Centralized billing for all team members.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewBilling('Personal Prepaid')}
                  className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                    newBilling === 'Personal Prepaid'
                      ? 'border-lime-400 bg-lime-500/10 text-zinc-900 dark:text-zinc-100 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Personal Prepaid</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block leading-tight font-sans">
                    Dedicated personal usage balance.
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Creating…</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-zinc-950" />
                    <span>Create &amp; Switch</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Workspace Selection Cards List */
          <div className="space-y-4">
            <div className="space-y-3 font-mono text-xs max-h-[320px] overflow-y-auto pr-1">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                return (
                  <div
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isActive
                        ? 'border-2 border-lime-400 bg-lime-500/5 dark:bg-lime-500/10 shadow-lg'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 hover:border-lime-400/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
                          {ws.name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 border border-lime-400/30 text-[10px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold uppercase border border-purple-500/20">
                        {ws.role}
                      </span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 font-mono">
                      <span>{ws.calls}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ws.balance}</span>
                      <span>•</span>
                      <span>{ws.keysCount} Vault Keys</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Footer */}
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-lime-400 text-zinc-700 dark:text-zinc-300 hover:text-lime-500 font-mono font-bold text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/40"
            >
              <Plus className="w-4 h-4 text-lime-500" />
              <span>+ Create New Workspace</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );

  return createPortal(modalContent, document.body);
};
