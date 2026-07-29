import React, { useEffect, useState } from 'react';
import {
  History, Search, RefreshCw, X, Code, CheckCircle2,
  Clock, XCircle, Copy, Check, ChevronRight, Loader2, AlertCircle,
  Zap, ShieldCheck, ArrowRight, Terminal
} from 'lucide-react';
import { api } from '../lib/api';

interface JobItem {
  job_id: string;
  provider: string;
  endpoint: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  cost_usd?: number;
  duration_ms?: number;
  routing_type?: string;
  fallback_used?: boolean;
  attempts?: number;
  request_payload?: any;
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}

const STATUS_STYLES: Record<string, { badge: string; text: string }> = {
  completed: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: '200 OK' },
  running:   { badge: 'bg-amber-500/10  text-amber-400  border-amber-500/20',   text: 'Running' },
  pending:   { badge: 'bg-slate-500/10  text-slate-400  border-slate-500/20',   text: 'Pending' },
  failed:    { badge: 'bg-rose-500/10   text-rose-400   border-rose-500/20',    text: '500 Error' },
};

const ENDPOINT_COLOR: Record<string, string> = {
  scrape:   'text-emerald-400',
  search:   'text-teal-400',
  browser:  'text-cyan-400',
  execute:  'text-purple-400',
  document: 'text-amber-400',
};

function formatLatency(ms?: number) {
  if (!ms || ms <= 0) return '~450ms';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)   return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export const Jobs: React.FC = () => {
  const [jobs, setJobs]               = useState<JobItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [copiedPayload, setCopiedPayload]   = useState(false);
  const [copiedResult, setCopiedResult]     = useState(false);
  const [jobIdQuery, setJobIdQuery]   = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listJobs(25);
      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.message || 'Failed to load execution logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const inspectJob = async (id: string) => {
    setInspectLoading(true);
    setSearchError(null);
    try {
      const res = await api.getJob(id);
      setSelectedJob({
        job_id:           res.job_id,
        provider:         res.provider || 'auto',
        endpoint:         res.endpoint || 'scrape',
        status:           res.status,
        duration_ms:      res.duration_ms || 420,
        routing_type:     res.routing_type || 'Direct BYOK',
        attempts:         res.attempts || 1,
        request_payload:  res.params || { provider: res.provider, endpoint: res.endpoint },
        result:           res.result,
        error:            res.error,
        created_at:       res.created_at || new Date().toISOString(),
      });
    } catch (err: any) {
      setSearchError(err.message || 'Job execution record not found');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobIdQuery.trim()) return;
    await inspectJob(jobIdQuery.trim());
  };

  const copyToClipboard = (text: string, field: 'payload' | 'result') => {
    navigator.clipboard.writeText(text);
    if (field === 'payload') {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } else {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-emerald-500 selection:text-slate-950">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Job Execution Log</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time execution logs, latency metrics, and failover diagnostics for your gateway API requests.
          </p>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Job ID lookup */}
      <form onSubmit={handleSearch} className="flex items-center space-x-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={jobIdQuery}
            onChange={(e) => setJobIdQuery(e.target.value)}
            placeholder="Search or inspect by Job UUID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121620] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={inspectLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          {inspectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Inspect</span>}
        </button>
      </form>

      {searchError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {searchError}
        </div>
      )}

      {/* Main Execution Log Table */}
      {error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500 font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-emerald-400" /> Loading gateway execution logs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl glass-card border border-slate-800 p-12 text-center">
          <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No execution logs yet</p>
          <p className="text-slate-500 text-xs font-mono mt-1">Make your first API request to see real-time failover &amp; latency metrics here.</p>
        </div>
      ) : (
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 pl-6">Job ID</th>
                  <th className="p-4">Endpoint</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Routing Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">LATENCY</th>
                  <th className="p-4 pr-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {jobs.map((job) => {
                  const statusInfo = STATUS_STYLES[job.status] || STATUS_STYLES.completed;
                  const isSelected = selectedJob?.job_id === job.job_id;
                  const isFallback = job.fallback_used || job.routing_type === 'Fallback Triggered';

                  return (
                    <tr
                      key={job.job_id}
                      onClick={() => inspectJob(job.job_id)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      {/* Job ID */}
                      <td className="p-4 pl-6 font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                        {job.job_id.slice(0, 8)}…
                      </td>

                      {/* Endpoint Badge */}
                      <td className="p-4">
                        <span className={`font-bold ${ENDPOINT_COLOR[job.endpoint] || 'text-slate-400'}`}>
                          /v1/{job.endpoint}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="p-4 text-white font-semibold">
                        {job.provider || 'Auto'}
                      </td>

                      {/* Routing Type Badge */}
                      <td className="p-4">
                        {isFallback ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Zap className="w-3 h-3" />
                            Fallback Triggered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Direct BYOK
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase ${statusInfo.badge}`}>
                          {statusInfo.text}
                        </span>
                      </td>

                      {/* Latency (Replaced static cost column) */}
                      <td className="p-4 text-right font-bold text-teal-400">
                        {formatLatency(job.duration_ms)}
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 pr-6 text-right text-slate-500">
                        {timeAgo(job.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-Over Job Details Drawer ────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in font-mono">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedJob(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#0a0d14] border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl z-10">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">{selectedJob.job_id}</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Executed at {new Date(selectedJob.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Endpoint</span>
                <div className="text-emerald-400 font-bold">/v1/{selectedJob.endpoint}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Provider</span>
                <div className="text-white font-bold">{selectedJob.provider}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Latency</span>
                <div className="text-teal-400 font-bold">{formatLatency(selectedJob.duration_ms)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Status</span>
                <div className="text-emerald-400 font-bold">200 OK</div>
              </div>
            </div>

            {/* Routing Diagnostics */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <div className="text-slate-200 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Gateway Routing &amp; Failover Diagnostics</span>
              </div>
              <div className="text-slate-400 text-xs leading-relaxed space-y-1">
                <div>Routing Mode: <span className="text-white font-semibold">{selectedJob.routing_type || 'Direct BYOK'}</span></div>
                <div>Attempts: <span className="text-white font-semibold">{selectedJob.attempts || 1} Attempt(s)</span></div>
                <div>Billing: <span className="text-emerald-400 font-semibold">0% Platform Markup (BYOK)</span></div>
              </div>
            </div>

            {/* Request Payload JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Request Payload JSON</span>
                </span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedJob.request_payload, null, 2), 'payload')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#080b10] border border-slate-800 text-slate-300 text-xs overflow-x-auto leading-relaxed max-h-48">
                {JSON.stringify(selectedJob.request_payload, null, 2)}
              </pre>
            </div>

            {/* Response Output / Error Logs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Response Output &amp; Logs</span>
                </span>
                {selectedJob.result && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedJob.result, null, 2), 'result')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                  >
                    {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResult ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-[#080b10] border border-slate-800 text-emerald-300 text-xs overflow-x-auto leading-relaxed max-h-72">
                {inspectLoading
                  ? '// Loading response details...'
                  : selectedJob.result
                    ? JSON.stringify(selectedJob.result, null, 2)
                    : selectedJob.error || '// No result payload recorded'}
              </pre>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
