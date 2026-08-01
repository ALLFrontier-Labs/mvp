import React, { useState } from 'react';
import { Sliders, Copy, Check, Send, CheckCircle2, Loader2, ShieldCheck, Bell } from 'lucide-react';

export const SettingsWebhooks: React.FC = () => {
  const [webhookUrl, setWebhookUrl]   = useState('https://your-api.com/webhooks/litedaemon');
  const [balanceLow, setBalanceLow]   = useState(true);
  const [keyFailover, setKeyFailover] = useState(true);
  const [rateLimit, setRateLimit]     = useState(false);
  const [signingSecret]               = useState('whsec_8f91c30a41d99042b8e219ef84a1');
  const [copiedSecret, setCopiedSecret] = useState(false);
  
  // Send test event state
  const [sendingTest, setSendingTest]   = useState(false);
  const [testResult, setTestResult]     = useState<{ status: number; latencyMs: number } | null>(null);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(signingSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleSendTestEvent = () => {
    setSendingTest(true);
    setTestResult(null);

    setTimeout(() => {
      setSendingTest(false);
      setTestResult({ status: 200, latencyMs: 84 });
    }, 1000);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl space-y-6 font-sans">
      
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 font-mono">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <Bell className="w-4 h-4 text-lime-500" />
          <span>Webhooks &amp; Notification Engine</span>
        </div>

        <button
          type="button"
          onClick={handleSendTestEvent}
          disabled={sendingTest}
          className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {sendingTest ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending Test Webhook…</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Event</span>
            </>
          )}
        </button>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-in fade-in">
          <span className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Webhook Test Delivered Successfully: HTTP 200 OK — Roundtrip: {testResult.latencyMs}ms
          </span>
          <span className="text-[10px] text-zinc-400">Just now</span>
        </div>
      )}

      {/* Webhook Form */}
      <div className="space-y-4 font-mono text-xs">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Webhook Listener URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-lime-500 focus:outline-none"
          />
        </div>

        {/* Trigger Events Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Trigger Event Subscriptions:</label>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={balanceLow}
                onChange={e => setBalanceLow(e.target.checked)}
                className="accent-lime-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">balance.low</span>
                <span className="text-[11px] text-zinc-400 font-sans">Fired when prepaid wallet balance drops below configured threshold.</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={keyFailover}
                onChange={e => setKeyFailover(e.target.checked)}
                className="accent-lime-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">key.failover</span>
                <span className="text-[11px] text-zinc-400 font-sans">Fired when a provider key encounters HTTP 429 and auto-rotates to secondary vault key.</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={rateLimit}
                onChange={e => setRateLimit(e.target.checked)}
                className="accent-lime-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">rate_limit.exceeded</span>
                <span className="text-[11px] text-zinc-400 font-sans">Fired when gateway throughput limits are triggered.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Signing Secret Box */}
        <div className="space-y-1 pt-2">
          <label className="text-[10px] uppercase font-bold text-zinc-400">HMAC Webhook Signing Secret:</label>
          <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <code className="flex-1 text-xs text-lime-400 font-mono">{signingSecret}</code>
            <button
              type="button"
              onClick={handleCopySecret}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
            >
              {copiedSecret ? 'Copied!' : 'Copy Secret'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
