import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Copy, Check, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { getStoredApiKey } from '../lib/api';

export const Settings: React.FC = () => {
  const currentKey = getStoredApiKey();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskedKey = currentKey
    ? `${currentKey.slice(0, 7)}${'•'.repeat(30)}${currentKey.slice(-4)}`
    : 'No active API key found';

  const handleCopy = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          <span>Account & API Key Settings</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your master API key and security preferences.
        </p>
      </div>

      {/* API Key Box */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Master Gateway API Key</span>
          </div>
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Bearer Auth Token</label>
          <div className="flex items-center space-x-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all">
            <span className="flex-1">{showKey ? currentKey : maskedKey}</span>
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={showKey ? 'Mask Key' : 'Reveal Key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
              title="Copy Key"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Rotation Note */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Storage Policy</span>
          </div>
          <p>
            LiteDaemon stores only the SHA-256 hash of your API key in Supabase. Your raw key is validated against Upstash Redis cache in under 10ms per request.
          </p>
        </div>
      </div>

    </div>
  );
};
