import React, { useEffect, useState } from 'react';
import {
  History, Search, RefreshCw, X, Code, CheckCircle2,
  Clock, XCircle, Copy, Check, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';

interface JobItem {
  job_id: string;
  provider: string;
  endpoint: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  cost_usd: number;
  duration_ms?: number;
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  running:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
  pending:   'bg-slate-500/10  text-slate-400  border-slate-500/20',
  failed:    'bg-rose-500/10   text-rose-400   border-rose-500/20',
};

const ENDPOINT_COLOR: Record<string, string> = {
  scrape:  'text-emerald-400',
  search:  'text-teal-400',
  browser: 'text-cyan-400',
  execute: 'text-purple-400',
};

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)  return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export const Jobs: React.FC = () => {
  const [jobs, setJobs]             = useState<JobItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [jobIdQuery, setJobIdQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listJobs(20);
      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
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
        job_id:    res.job_id,
        provider:  res.provider,
        endpoint:  '/v1/...',
        status:    res.status,
        cost_usd:  res.cost_usd || 0,
        result:    res.result,
        error:     res.error,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setSearchError(err.message || 'Job not found');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobIdQuery.trim()) return;
    await inspectJob(jobIdQuery.trim());
  };

  const pollStatus = async (id: string) => {
    setInspectLoading(true);
    try {
      const res = await api.getJob(id);
      setSelectedJob(prev => prev ? { ...prev, status: res.status, result: res.result, error: res.error } : null);
    } catch { /* ignore */ } finally {
      setInspectLoading(false);
    }
  };

  const copyJson = () => {
    if (selectedJob?.result) {
      navigator.clipboard.writeText(JSON.stringify(selectedJob.result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Job Execution Log</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Full history of your API calls. Click any job to inspect results.
          </p>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
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
            placeholder="Inspect by Job UUID…"
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

      {/* Job list table */}
      {error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl glass-card border border-slate-800 p-12 text-center">
          <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No jobs yet — make your first API call to see history here.</p>
        </div>
      ) : (
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                <th className="text-left p-4">Job ID</th>
                <th className="text-left p-4">Provider</th>
                <th className="text-left p-4">Endpoint</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Cost</th>
                <th className="text-right p-4">When</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr
                  key={job.job_id}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer ${
                    selectedJob?.job_id === job.job_id ? 'bg-emerald-500/5' : ''
                  } ${i === jobs.length - 1 ? 'border-0' : ''}`}
                  onClick={() => inspectJob(job.job_id)}
                >
                  <td className="p-4 text-slate-400">{job.job_id.slice(0, 8)}…</td>
                  <td className="p-4 text-white font-semibold">{job.provider}</td>
                  <td className="p-4">
                    <span className={`font-bold ${ENDPOINT_COLOR[job.endpoint] || 'text-slate-400'}`}>
                      /v1/{job.endpoint}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${STATUS_STYLES[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-emerald-400">${job.cost_usd.toFixed(4)}</td>
                  <td className="p-4 text-right text-slate-500">{timeAgo(job.created_at)}</td>
                  <td className="p-4 text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON Inspector panel */}
      {selectedJob && (
        <div className="rounded-2xl bg-[#0a0d14] border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold font-mono text-white">{selectedJob.job_id}</span>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[selectedJob.status]}`}>
                {selectedJob.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {selectedJob.status === 'running' && (
                <button
                  onClick={() => pollStatus(selectedJob.job_id)}
                  disabled={inspectLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${inspectLoading ? 'animate-spin' : ''}`} />
                  Poll Status
                </button>
              )}
              {selectedJob.result && (
                <button
                  onClick={copyJson}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy JSON
                </button>
              )}
              <button onClick={() => setSelectedJob(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div>Provider: <span className="text-white font-semibold">{selectedJob.provider}</span></div>
            <div>Cost: <span className="text-emerald-400 font-semibold">${selectedJob.cost_usd.toFixed(4)}</span></div>
            <div>Status: <span className="text-white font-semibold">{selectedJob.status}</span></div>
            <div>Time: <span className="text-white font-semibold">{timeAgo(selectedJob.created_at)}</span></div>
          </div>

          <pre className="p-4 rounded-xl bg-[#121620] border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {inspectLoading
              ? '// Loading…'
              : selectedJob.result
                ? JSON.stringify(selectedJob.result, null, 2)
                : selectedJob.error || '// No result yet'}
          </pre>
        </div>
      )}

    </div>
  );
};
