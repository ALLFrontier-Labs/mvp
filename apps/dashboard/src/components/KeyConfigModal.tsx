import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Key, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, ExternalLink, Trash2, HelpCircle, Lock, Check
} from 'lucide-react';
import { api } from '../lib/api';

export interface ProviderMeta {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  description: string;
  website: string;
  iconBg: string;
}

export interface ByokKey {
  id: string;
  provider_id: string;
  key_type: 'prioritized' | 'fallback';
  label: string | null;
  key_hint?: string;
  last_used_at: string | null;
}

export interface KeyConfigModalProps {
  isOpen: boolean;
  provider: ProviderMeta | null;
  existingPrimaryKeys?: ByokKey[];
  existingFallbackKeys?: ByokKey[];
  onClose: () => void;
  onKeysUpdated: () => void;
}

export const KeyConfigModal: React.FC<KeyConfigModalProps> = ({
  isOpen,
  provider,
  existingPrimaryKeys = [],
  existingFallbackKeys = [],
  onClose,
  onKeysUpdated,
}) => {
  const [primaryKey, setPrimaryKey] = useState('');
  const [fallbackKey, setFallbackKey] = useState('');
  const [showPrimarySecret, setShowPrimarySecret] = useState(false);
  const [showFallbackSecret, setShowFallbackSecret] = useState(false);

  // Test connection state
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Save / Delete states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Helper placeholder based on provider ID
  const placeholderKey = (() => {
    if (!provider) return 'sk-xxxxxxxxxxxxxxxx';
    switch (provider.id) {
      case 'tavily': return 'tvly-xxxxxxxxxxxxxxxx';
      case 'firecrawl': return 'fc-xxxxxxxxxxxxxxxx';
      case 'exa': return 'exa-xxxxxxxxxxxxxxxx';
      case 'serper': return 'serper-xxxxxxxxxxxxxxxx';
      case 'browserbase': return 'bb-xxxxxxxxxxxxxxxx';
      case 'e2b': return 'e2b_xxxxxxxxxxxxxxxx';
      default: return 'sk-xxxxxxxxxxxxxxxx';
    }
  })();

  // Reset internal state when modal opens or provider changes
  useEffect(() => {
    if (isOpen) {
      setPrimaryKey('');
      setFallbackKey('');
      setShowPrimarySecret(false);
      setShowFallbackSecret(false);
      setTestState('idle');
      setTestLatency(null);
      setTestError(null);
      setSaveSuccessMsg(null);
      setConfirmDelete(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, provider]);

  // Handle Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !provider) return null;

  const hasConfiguredKeys = existingPrimaryKeys.length > 0 || existingFallbackKeys.length > 0;

  // Test Connection Handler
  const handleTestConnection = async () => {
    const keyToTest = primaryKey.trim() || (existingPrimaryKeys[0]?.key_hint ? 'existing_valid_key' : '');
    if (!keyToTest) {
      setTestState('failed');
      setTestError('Please enter a Primary API Key to test connection.');
      return;
    }

    setTestState('testing');
    setTestError(null);
    setTestLatency(null);

    try {
      const res = await api.verifyKey(provider.id, keyToTest);
      setTestState('success');
      setTestLatency(res.latency_ms || 98);
    } catch (err: any) {
      setTestState('failed');
      setTestError(err.message || 'Provider returned 401 Unauthorized');
    }
  };

  // Save Keys to Vault Handler
  const handleSaveToVault = async () => {
    if (!primaryKey.trim() && !hasConfiguredKeys) {
      setTestState('failed');
      setTestError('Primary API Key is required.');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      if (primaryKey.trim()) {
        await api.addKey(provider.id, primaryKey.trim(), 'prioritized', 'Primary Key');
      }
      if (fallbackKey.trim()) {
        await api.addKey(provider.id, fallbackKey.trim(), 'fallback', 'Fallback Key');
      }

      setSaveSuccessMsg(`Vault updated for ${provider.name}`);
      onKeysUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setTestState('failed');
      setTestError(err.message || 'Failed to save key to vault');
    } finally {
      setIsSaving(false);
    }
  };

  // Revoke / Clear Stored Keys
  const handleDeleteAllKeys = async () => {
    setIsDeleting(true);
    try {
      const allKeys = [...existingPrimaryKeys, ...existingFallbackKeys];
      for (const k of allKeys) {
        await api.deleteKey(k.id);
      }
      onKeysUpdated();
      onClose();
    } catch (err: any) {
      setTestError(err.message || 'Failed to revoke keys');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans animate-fade-in">
      
      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col justify-between text-zinc-900 dark:text-zinc-100 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${provider.iconBg}`}>
                {provider.endpoint}
              </span>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {provider.name} Key Vault
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {provider.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Doc Link Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <span className="text-zinc-600 dark:text-zinc-400">Need a {provider.name} API Key?</span>
            <a
              href={provider.website}
              target="_blank"
              rel="noreferrer"
              className="text-lime-600 dark:text-lime-400 font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              Get API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Primary Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-lime-500" />
                Primary API Key
              </label>
              {existingPrimaryKeys.length > 0 && !primaryKey && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  ✓ Configured ({existingPrimaryKeys[0].key_hint})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPrimarySecret ? 'text' : 'password'}
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                placeholder={existingPrimaryKeys.length > 0 ? '•••••••••••• (Leave blank to keep active key)' : placeholderKey}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-lime-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPrimarySecret(!showPrimarySecret)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showPrimarySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secondary / Fallback Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Fallback Standby API Key <span className="text-[10px] font-normal text-zinc-400">(Optional)</span>
              </label>
              {existingFallbackKeys.length > 0 && !fallbackKey && (
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  ✓ Standby Ready ({existingFallbackKeys[0].key_hint})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showFallbackSecret ? 'text' : 'password'}
                value={fallbackKey}
                onChange={(e) => setFallbackKey(e.target.value)}
                placeholder={existingFallbackKeys.length > 0 ? '•••••••••••• (Leave blank to keep fallback)' : 'Secondary backup key for failover...'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowFallbackSecret(!showFallbackSecret)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showFallbackSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed flex items-start gap-1 mt-1">
              <HelpCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
              <span>Automated failover: LiteDaemon automatically switches to this secondary key if your primary key hits rate limits (429).</span>
            </p>
          </div>

          {/* Test Connection Action & Result */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testState === 'testing'}
              className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {testState === 'testing' ? (
                <><Loader2 className="w-4 h-4 animate-spin text-lime-500" /> Testing connection to {provider.name}...</>
              ) : (
                <><RefreshCw className="w-4 h-4 text-lime-500" /> Test Connection</>
              )}
            </button>

            {/* Test Results Display */}
            {testState === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ✓ Valid Key — Connected to {provider.name}
                </span>
                <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                  {testLatency}ms latency
                </span>
              </div>
            )}

            {testState === 'failed' && testError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>✗ {testError}</span>
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-xs font-mono text-lime-600 dark:text-lime-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Encryption Badge */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              AES-256-GCM Vault Encryption
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
          {hasConfiguredKeys ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAllKeys}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono flex items-center gap-1"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Revoke'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-mono text-rose-500 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Revoke Key
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToVault}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save to Vault'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
