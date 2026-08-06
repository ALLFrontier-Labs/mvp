import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Settings as SettingsIcon, Key, Copy, Check, Eye, EyeOff,
  Shield, User, Wallet, Activity, DollarSign, LogOut,
  Loader2, AlertCircle, Calendar, CreditCard, Terminal, RefreshCw,
  X, CheckCircle2, Zap, FileText, Monitor, Search, Globe, Info, Plus,
  Bell, Lock, Sliders, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { api, getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../lib/api';
import { RegenerateKeyModal } from '../components/RegenerateKeyModal';

interface Me {
  email: string;
  plan: string;
  created_at: string;
  balance_usd: number;
  total_calls: number;
  billed_calls: number;
  total_spent_usd: number;
}

type SettingsSubTab = 'general' | 'billing' | 'reference';
type EndpointTab    = 'scrape' | 'search' | 'browser' | 'execute' | 'document';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('general');

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toLowerCase();
    if (tabParam === 'profile' || tabParam === 'general') {
      setActiveSubTab('general');
    } else if (tabParam === 'billing' || tabParam === 'wallet') {
      setActiveSubTab('billing');
    } else if (tabParam === 'reference') {
      setActiveSubTab('reference');
    }
  }, [searchParams]);

  // Key & Auth States
  const [currentKey, setCurrentKey] = useState<string | null>(getStoredApiKey());
  const [showKey, setShowKey]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // User Profile Metadata State
  const [me, setMe]                       = useState<Me | null>(null);
  const [userKeysCount, setUserKeysCount] = useState<number>(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Quick Reference Endpoint Tab State
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointTab>('scrape');

  const [depositToast, setDepositToast]               = useState<string | null>(null);

  // Key Regeneration Modal State
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating]             = useState(false);
  const [regenerateSuccess, setRegenerateSuccess]         = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMe().catch(e => { setError(e.message); return null; }),
      api.listKeys().catch(() => ({ keys: [] })),
    ]).then(([meData, keysData]) => {
      if (meData) setMe(meData);
      setUserKeysCount((keysData.keys || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const maskedKey = currentKey
    ? `${currentKey.slice(0, 10)}${'•'.repeat(28)}${currentKey.slice(-6)}`
    : 'No active key';

  const copyKey = () => {
    if (!currentKey) return;
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Key regeneration is handled entirely by the RegenerateKeyModal
  // which calls POST /v1/auth/regenerate server-side.

  // Dynamic cURL examples per endpoint
  const CURL_EXAMPLES: Record<EndpointTab, string> = {
    scrape: `curl -X POST https://litedaemon.xyz/v1/scrape \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"firecrawl","params":{"url":"https://example.com","format":"markdown"}}'`,
    search: `curl -X POST https://litedaemon.xyz/v1/search \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"tavily","params":{"query":"latest AI agent tools 2026","limit":5}}'`,
    browser: `curl -X POST https://litedaemon.xyz/v1/browser \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"steel","params":{"script":"await page.goto(\\"https://example.com\\");","viewport":{"width":1920,"height":1080}}}'`,
    execute: `curl -X POST https://litedaemon.xyz/v1/execute \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"e2b","params":{"code":"print(\\"Hello from LiteDaemon sandbox!\\")","timeout_sec":30}}'`,
    document: `curl -X POST https://litedaemon.xyz/v1/document \\
  -H "Authorization: Bearer ${currentKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"llamaparse","params":{"url":"https://example.com/doc.pdf","format":"markdown"}}'`,
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(CURL_EXAMPLES[selectedEndpoint]);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSignOut = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans selection:bg-lime-400 selection:text-zinc-950">

      {/* ── HEADER & SIGN OUT ACTION ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Account &amp; Developer Settings</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Manage your Master Gateway API keys, prepaid routing wallet, budget guardrails, and security policies.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Success Deposit Toast */}
      {depositToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {depositToast}
          </span>
          <span className="text-[10px] text-zinc-400">Updated Live</span>
        </div>
      )}

      {/* ── SETTINGS SUB-NAVIGATION TABS BAR ────────────────────────────────── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 flex space-x-6 overflow-x-auto font-mono text-xs">
        {[
          { id: 'general',   label: 'General & Keys' },
          { id: 'billing',   label: 'Billing & Wallet' },
          { id: 'reference', label: 'Quick Reference' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SettingsSubTab)}
              className={`pb-3 font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-b-2 border-lime-400 text-lime-600 dark:text-lime-400 font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: GENERAL PROFILE & MASTER KEY MANAGEMENT ─────────────────── */}
      {activeSubTab === 'general' && (
        <div className="space-y-6">
          
          {/* Profile Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
              <User className="w-4 h-4 text-lime-500" />
              <span>Account &amp; Security Overview</span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono py-4">
                <Loader2 className="w-4 h-4 animate-spin text-lime-500" /> Loading account metadata…
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-rose-500 text-xs py-4 font-mono">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            ) : me ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Account Identifier</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">{me.email}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Gateway Access Tier</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[11px]">
                    <CreditCard className="w-3 h-3" /> DEVELOPER GATEWAY
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Member Since</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{formatDate(me.created_at)}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Security Enforcement</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 • AES-256 Vault
                  </span>
                </div>

              </div>
            ) : null}
          </div>

          {/* Clear Security Info Banner */}
          <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-xs font-mono text-zinc-700 dark:text-zinc-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>LiteDaemon BYOK Architecture</strong> — Master API Keys are SHA-256 hashed for instant gateway validation. Downstream provider keys are encrypted client-side using AES-256-GCM and never stored in plain text.
            </p>
          </div>

          {/* Master Gateway API Key Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Key className="w-4 h-4 text-lime-500" />
                <span>Master Gateway API Key</span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ACTIVE
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Bearer Token Header</span>
                <button
                  onClick={() => setIsRegenerateModalOpen(true)}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Key</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <code className="flex-1 text-xs text-emerald-400 font-mono break-all">
                  {showKey ? currentKey : maskedKey}
                </code>

                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors shrink-0"
                  title={showKey ? 'Hide Token' : 'Reveal Token'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={copyKey}
                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors shrink-0"
                  title="Copy Bearer Token"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: PREPAID WALLET & METERED BILLING BAR ────────────────────── */}
      {(activeSubTab === 'billing' || activeSubTab === 'general') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-lime-500" />
              <span>Prepaid Wallet &amp; Metered Billing</span>
            </h3>

            <Link
              to="/billing"
              className="text-xs text-lime-600 dark:text-lime-400 hover:underline font-bold flex items-center gap-1"
            >
              Billing Details <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            
            {/* Card 1: Prepaid Gateway Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
                <span>Prepaid Gateway Balance</span>
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ${me ? me.balance_usd.toFixed(4) : '$\u2014'}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400">Micro-debited per call</span>
                <button
                  onClick={() => navigate('/billing')}
                  className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  + Deposit Funds
                </button>
              </div>
            </div>

            {/* Card 2: Total Requests Metered */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
                <span>Total Gateway Requests Metered</span>
                <Activity className="w-4 h-4 text-cyan-500" />
              </div>

              <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
                {me ? me.total_calls.toLocaleString() : '10'} Calls
              </div>

              <span className="text-[10px] text-zinc-400 block">Unified endpoint executions</span>
            </div>

            {/* Card 3: Platform Routing Fees */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
                <span>Platform Routing Fees</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>

              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                ${me ? me.total_spent_usd.toFixed(4) : '$\u2014'}
              </div>

              <span className="text-[10px] text-zinc-400 block">Flat 5% BYOK optimization fee</span>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 3: QUICK CURL REFERENCE ENGINE ─────────────────────────────── */}
      {(activeSubTab === 'reference' || activeSubTab === 'general') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <Terminal className="w-4 h-4 text-lime-500" />
              <span>Quick API cURL Reference Engine</span>
            </div>

            <button
              onClick={copyCurl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-lime-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCurl ? 'Copied!' : 'Copy cURL'}
            </button>
          </div>

          {/* 5 Endpoint Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'scrape',   label: '/v1/scrape',   color: 'text-emerald-500', icon: Globe },
              { id: 'search',   label: '/v1/search',   color: 'text-teal-500',    icon: Search },
              { id: 'browser',  label: '/v1/browser',  color: 'text-cyan-500',    icon: Monitor },
              { id: 'execute',  label: '/v1/execute',  color: 'text-purple-500',  icon: Terminal },
              { id: 'document', label: '/v1/document', color: 'text-amber-500',   icon: FileText },
            ].map(tab => {
              const isSelected = selectedEndpoint === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedEndpoint(tab.id as EndpointTab)}
                  className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-lime-400 text-zinc-950 font-bold border-lime-400 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic cURL Code Block */}
          <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-56">
            {CURL_EXAMPLES[selectedEndpoint]}
          </pre>
        </div>
      )}

      {/* ── MASTER KEY REGENERATION SAFETY MODAL ────────────────────────────── */}
      <RegenerateKeyModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        onKeyRegenerated={(newKey) => setCurrentKey(newKey)}
      />

    </div>
  );
};
