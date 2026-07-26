import React, { useState } from 'react';
import { History, Search, RefreshCw, X, Code, CheckCircle2, Clock, XCircle, ChevronRight, Copy, Check } from 'lucide-react';
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
}

export const Jobs: React.FC = () => {
  const [jobIdQuery, setJobIdQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [searchedJob, setSearchedJob] = useState<JobItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearchJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobIdQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.getJob(jobIdQuery.trim());
      const job: JobItem = {
        job_id: res.job_id,
        provider: res.provider,
        endpoint: '/v1/...',
        status: res.status,
        cost_usd: res.cost_usd || 0,
        result: res.result,
        error: res.error,
        created_at: new Date().toISOString(),
      };
      setSearchedJob(job);
      setSelectedJob(job);
    } catch (err: any) {
      setError(err.message || 'Job not found');
      setSearchedJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePollStatus = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getJob(id);
      const updated: JobItem = {
        ...selectedJob!,
        status: res.status,
        result: res.result,
        error: res.error,
      };
      setSelectedJob(updated);
      setSearchedJob(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <span>Job Execution Log & Inspector</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Inspect raw JSON outputs, execution duration, and poll async jobs.
          </p>
        </div>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearchJob} className="flex items-center space-x-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={jobIdQuery}
            onChange={(e) => setJobIdQuery(e.target.value)}
            placeholder="Enter Job UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121620] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Inspect Job</span>}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Searched Job Card */}
      {searchedJob && (
        <div className="rounded-2xl glass-card border border-emerald-500/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-white">{searchedJob.job_id}</span>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                searchedJob.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                searchedJob.status === 'running' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {searchedJob.status}
              </span>
            </div>

            {searchedJob.status === 'running' && (
              <button
                onClick={() => handlePollStatus(searchedJob.job_id)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Poll Status</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div>Provider: <span className="text-white font-semibold">{searchedJob.provider}</span></div>
            <div>Cost: <span className="text-emerald-400 font-semibold">${searchedJob.cost_usd.toFixed(4)}</span></div>
            <div>Status: <span className="text-white font-semibold">{searchedJob.status}</span></div>
            <div>Mode: <span className="text-white font-semibold">Zero-Margin</span></div>
          </div>
        </div>
      )}

      {/* JSON Inspector Drawer / Modal */}
      {selectedJob && (
        <div className="rounded-2xl bg-[#0a0d14] border border-slate-800 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Result Output JSON — {selectedJob.provider}</span>
            </h3>
            <div className="flex items-center space-x-2">
              {selectedJob.result && (
                <button
                  onClick={copyJson}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON</span>
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-[#121620] border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {selectedJob.result ? JSON.stringify(selectedJob.result, null, 2) : selectedJob.error || '// No result returned yet'}
          </pre>
        </div>
      )}

    </div>
  );
};
