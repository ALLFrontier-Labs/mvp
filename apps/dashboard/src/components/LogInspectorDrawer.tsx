import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X, Copy, Check, Terminal, Play, ShieldCheck, Cpu,
  AlertCircle, CheckCircle2, RefreshCw, Zap, Server, Code,
  Layers, Clock, ArrowRight, Lock
} from 'lucide-react';
import { JobItem } from '../pages/Jobs';

export interface LogInspectorDrawerProps {
  isOpen: boolean;
  job: JobItem | null;
  onClose: () => void;
}

export const LogInspectorDrawer: React.FC<LogInspectorDrawerProps> = ({
  isOpen,
  job,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'payload' | 'response' | 'diagnostics'>('payload');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Lock body scroll when open
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

  // Reset tab on job change
  useEffect(() => {
    setActiveTab('payload');
    setCopiedCurl(false);
    setCopiedPayload(false);
    setCopiedResponse(false);
  }, [job]);

  if (!isOpen || !job) return null;

  const isSuccess = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const durationMs = job.duration_ms || 420;
  const gatewayOverheadMs = Math.min(18, Math.max(8, Math.floor(durationMs * 0.04)));
  const upstreamMs = Math.max(10, durationMs - gatewayOverheadMs);

  // Formatted cURL command string
  const curlCommand = (() => {
    const endpoint = job.endpoint || '/v1/search';
    const payloadJson = JSON.stringify(
      job.request_payload || { provider: job.provider, params: { query: 'Sample Request' } },
      null,
      2
    );
    return `curl -X POST https://litedaemon.xyz${endpoint} \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadJson}'`;
  })();

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyPayload = () => {
    const payloadStr = JSON.stringify(job.request_payload || {}, null, 2);
    navigator.clipboard.writeText(payloadStr);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyResponse = () => {
    const respStr = JSON.stringify(job.result || {}, null, 2);
    navigator.clipboard.writeText(respStr);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleReplayInPlayground = () => {
    onClose();
    navigate('/playground', { state: { endpoint: job.endpoint, provider: job.provider, payload: job.request_payload } });
  };

  return createPortal(
    <>
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-Over Drawer Panel */}
      <div className="fixed top-0 right-0 z-[9999] h-screen w-full max-w-2xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out font-sans">
        
        {/* Header Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 shrink-0 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-lime-600 dark:text-lime-400 bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
                  Job Trace #{job.job_id.slice(0, 14)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  isSuccess 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                  {isSuccess ? '✓ 200 OK' : '✗ 500 ERROR'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 pt-1">
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                  POST {job.endpoint}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Target: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{job.provider}</strong> · Latency: <strong className="text-emerald-600 dark:text-emerald-400">{durationMs}ms</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Bar (cURL & Replay) */}
          <div className="flex items-center gap-2 pt-1 font-mono">
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold transition-all shadow-sm"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5 text-lime-400" />}
              <span>{copiedCurl ? 'Copied cURL!' : 'Copy cURL Snippet'}</span>
            </button>

            <button
              onClick={handleReplayInPlayground}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-bold transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Re-play in Playground →</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2 pt-3 shrink-0 font-mono">
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'payload'
                ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Payload &amp; Headers
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'response'
                ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Response / Error Stack
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'diagnostics'
                ? 'border-lime-500 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Gateway Diagnostics
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* ── TAB 1: REQUEST PAYLOAD & HEADERS ──────────────────────────────── */}
          {activeTab === 'payload' && (
            <div className="space-y-5 font-mono">
              
              {/* Sanitized HTTP Headers */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                  Sanitized Request Headers:
                </span>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Host:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">litedaemon.xyz</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Authorization:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Bearer LITEDAEMON_MASTER_KEY (sk-ld-***)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Content-Type:</span>
                    <span className="text-zinc-800 dark:text-zinc-200">application/json</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">X-LiteDaemon-Routing:</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{job.routing_type || 'Direct BYOK'}</span>
                  </div>
                </div>
              </div>

              {/* Request JSON Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    Request Payload Body (JSON):
                  </span>
                  <button
                    onClick={handleCopyPayload}
                    className="text-lime-600 dark:text-lime-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    {copiedPayload ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs overflow-x-auto max-h-64">
                  {JSON.stringify(job.request_payload || { provider: job.provider, endpoint: job.endpoint }, null, 2)}
                </pre>
              </div>

              {/* cURL Command Snippet Preview */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                  Executable cURL Re-run Snippet:
                </span>
                <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] overflow-x-auto">
                  {curlCommand}
                </pre>
              </div>

            </div>
          )}

          {/* ── TAB 2: RESPONSE BODY / ERROR STACK ────────────────────────────── */}
          {activeTab === 'response' && (
            <div className="space-y-5 font-mono">
              
              {/* Failure Error Alert Banner if Error */}
              {isFailed && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Upstream Provider Failure Trace</span>
                  </div>
                  <p className="text-xs text-rose-500 dark:text-rose-300 leading-relaxed font-sans">
                    {job.error || 'Provider returned 500 Internal Error or 429 Rate Limit Exceeded.'}
                  </p>
                </div>
              )}

              {/* Response Output Data JSON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                    {isFailed ? 'Error Response Body (JSON):' : 'Response Output Data (JSON):'}
                  </span>
                  {job.result && (
                    <button
                      onClick={handleCopyResponse}
                      className="text-lime-600 dark:text-lime-400 hover:underline text-[11px] flex items-center gap-1"
                    >
                      {copiedResponse ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Output</>}
                    </button>
                  )}
                </div>

                <pre className={`p-4 rounded-xl bg-zinc-950 border text-xs overflow-x-auto max-h-96 ${
                  isFailed ? 'border-rose-500/30 text-rose-400' : 'border-zinc-800 text-zinc-200'
                }`}>
                  {job.result 
                    ? JSON.stringify(job.result, null, 2) 
                    : job.error 
                      ? JSON.stringify({ error: job.error, status: 500, provider: job.provider }, null, 2)
                      : JSON.stringify({ status: 200, message: 'Execution completed successfully', data: {} }, null, 2)
                  }
                </pre>
              </div>

            </div>
          )}

          {/* ── TAB 3: ROUTING & GATEWAY DIAGNOSTICS ─────────────────────────── */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5 font-mono">
              
              {/* Security Key Type Info */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      {job.routing_type === 'Pass-Through' ? 'Gateway Managed Routing' : 'Vaulted Direct BYOK'}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-sans">
                      {job.routing_type === 'Pass-Through' ? 'Executed using Master Key Pool' : 'Executed using client-side AES-256-GCM encrypted BYOK key'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Secure
                </span>
              </div>

              {/* Latency Performance Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                  Latency Breakdown Diagnostics:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Gateway Overhead</span>
                    <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">~{gatewayOverheadMs}ms</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Upstream Provider</span>
                    <span className="text-base font-bold text-teal-600 dark:text-teal-400 mt-1 block">{upstreamMs}ms</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Total Roundtrip</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{durationMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Failover Routing Log */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                  Automated Failover Log:
                </span>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Primary Key #1 Attempt: HTTP 200 OK — Successful</span>
                  </div>
                  {job.fallback_used && (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                      <span>Primary Key encountered 429 Rate Limit — Auto-rotated to Fallback Standby Key #1</span>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500 font-sans mt-1">
                    LiteDaemon monitors key quotas and automatically switches keys to ensure zero-downtime tool execution.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 flex justify-between items-center text-xs font-mono shrink-0">
          <span className="text-zinc-500">LiteDaemon Telemetry Engine v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </>,
    document.body
  );
};
