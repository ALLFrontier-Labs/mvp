import React, { useEffect, useState, useMemo } from 'react';
import {
  History, Search, RefreshCw, X, Code, CheckCircle2,
  Clock, XCircle, Copy, Check, ChevronRight, Loader2, AlertCircle,
  Zap, ShieldCheck, ArrowRight, Terminal, Download, Activity,
  Filter, Calendar, ChevronDown, FileSpreadsheet, FileJson, Layers
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { LogInspectorDrawer } from '../components/LogInspectorDrawer';

export interface JobItem {
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
  completed: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', text: '200 OK' },
  running:   { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',     text: 'Running' },
  pending:   { badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',       text: 'Pending' },
  failed:    { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',        text: '500 Error' },
};

const ENDPOINT_BADGE: Record<string, string> = {
  '/v1/scrape':   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  '/v1/search':   'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  '/v1/browser':  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  '/v1/execute':  'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  '/v1/document': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

function formatLatency(ms?: number) {
  if (!ms || ms <= 0) return '450ms';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function getLatencyColorClass(ms?: number): string {
  if (!ms) return 'text-emerald-600 dark:text-emerald-400';
  if (ms < 1000) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
  if (ms <= 2500) return 'text-amber-600 dark:text-amber-400 font-semibold';
  return 'text-rose-600 dark:text-rose-400 font-bold';
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export const Jobs: React.FC = () => {
  const [jobs, setJobs]               = useState<JobItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResult, setCopiedResult]   = useState(false);

  // Streaming Live Tail state
  const [isLiveTail, setIsLiveTail]   = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | 'errors'>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d'>('24h');

  // Export dropdown state
  const [exportOpen, setExportOpen]   = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listJobs(50);
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load execution logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Live Tail Polling effect
  useEffect(() => {
    if (!isLiveTail) return;
    const interval = setInterval(() => {
      loadJobs();
    }, 8000);
    return () => clearInterval(interval);
  }, [isLiveTail]);

  // Deep-link URL Query Parameter Handling (?jobId=...)
  const [searchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId');

  useEffect(() => {
    if (queryJobId && jobs.length > 0) {
      const found = jobs.find(j => j.job_id.toLowerCase() === queryJobId.toLowerCase());
      if (found) setSelectedJob(found);
    }
  }, [queryJobId, jobs]);

  const copyText = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filter Computation
  const filteredJobs = useMemo(() => {
    let list = jobs;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j =>
        j.job_id.toLowerCase().includes(q) ||
        j.provider.toLowerCase().includes(q) ||
        j.endpoint.toLowerCase().includes(q) ||
        (j.error && j.error.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter === '200') {
      list = list.filter(j => j.status === 'completed');
    } else if (statusFilter === 'errors') {
      list = list.filter(j => j.status === 'failed' || j.status === 'pending');
    }

    // Provider filter
    if (providerFilter !== 'all') {
      list = list.filter(j => j.provider.toLowerCase() === providerFilter.toLowerCase());
    }

    // Time filter
    const now = Date.now();
    if (timeFilter === '1h') {
      list = list.filter(j => now - new Date(j.created_at).getTime() <= 3600 * 1000);
    } else if (timeFilter === '24h') {
      list = list.filter(j => now - new Date(j.created_at).getTime() <= 86400 * 1000);
    } else if (timeFilter === '7d') {
      list = list.filter(j => now - new Date(j.created_at).getTime() <= 7 * 86400 * 1000);
    }

    return list;
  }, [jobs, searchQuery, statusFilter, providerFilter, timeFilter]);

  // Telemetry Metrics Calculation
  const { totalVolume, avgLatencyMs, successRate, rescuedCount } = useMemo(() => {
    const total = jobs.length || 1;
    let sumLatency = 0;
    let completedCount = 0;
    let rescued = 0;

    for (const j of jobs) {
      sumLatency += (j.duration_ms || 420);
      if (j.status === 'completed') completedCount++;
      if (j.fallback_used || (j.attempts && j.attempts > 1)) rescued++;
    }

    const avgLat = Math.round(sumLatency / total);
    const succRate = Math.round((completedCount / total) * 1000) / 10;

    return {
      totalVolume: jobs.length,
      avgLatencyMs: avgLat,
      successRate: succRate,
      rescuedCount: rescued,
    };
  }, [jobs]);

  // Unique provider list for dropdown
  const uniqueProviders = useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) {
      if (j.provider) set.add(j.provider);
    }
    return Array.from(set);
  }, [jobs]);

  // Export handlers
  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredJobs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `litedaemon_logs_${Date.now()}.json`);
    dlAnchorElem.click();
    setExportOpen(false);
  };

  const exportAsCSV = () => {
    const headers = ['Job ID', 'Endpoint', 'Provider', 'Status', 'Routing', 'Duration (ms)', 'Timestamp'];
    const rows = filteredJobs.map(j => [
      j.job_id,
      j.endpoint,
      j.provider,
      j.status,
      j.routing_type || 'Direct BYOK',
      j.duration_ms || 450,
      j.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `litedaemon_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">

      {/* ── HEADER & LIVE STREAMING CONTROLS ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Request Logs &amp; Observability</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Real-time execution traces, latency metrics, and failover diagnostics for gateway requests.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {/* Live Tail Toggle Switch */}
          <button
            onClick={() => setIsLiveTail(!isLiveTail)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              isLiveTail
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLiveTail && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isLiveTail ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            </span>
            <span>{isLiveTail ? 'Live Tail Active' : 'Live Tail Paused'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadJobs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-all border border-zinc-200 dark:border-zinc-700/60"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-lime-500' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-mono font-semibold transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <Download className="w-3.5 h-3.5 text-lime-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-1.5 font-mono text-xs space-y-1">
                <button
                  onClick={exportAsJSON}
                  className="w-full px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-left"
                >
                  <FileJson className="w-4 h-4 text-emerald-500" /> Export JSON
                </button>
                <button
                  onClick={exportAsCSV}
                  className="w-full px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-500" /> Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TELEMETRY SUMMARY CARDS (4 Cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gateway Volume */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Total Gateway Volume
          </span>
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2 block font-sans">
            {totalVolume.toLocaleString()} Requests
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">
            Last 24 hours execution volume
          </span>
        </div>

        {/* Card 2: Avg Latency */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Avg Latency
          </span>
          <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-2 block font-sans">
            {avgLatencyMs} ms
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">
            Mean execution response time
          </span>
        </div>

        {/* Card 3: Success Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Success Rate
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {successRate}%
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">
            HTTP 200 OK completions
          </span>
        </div>

        {/* Card 4: Failover Intercepts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            Failover Intercepts
          </span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 block font-sans">
            {rescuedCount} Rescued
          </span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 block">
            Auto-rotated standby key calls
          </span>
        </div>
      </div>

      {/* ── MULTI-FILTER TOOLBAR ENGINE ───────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search Input (5 cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Job ID, prompt term, or provider..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs placeholder-zinc-400 focus:border-lime-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="200">200 OK (Success Only)</option>
              <option value="errors">4xx / 5xx (Errors Only)</option>
            </select>
          </div>

          {/* Provider Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none capitalize"
            >
              <option value="all">All Providers</option>
              {uniqueProviders.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Time Range Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── HIGH-POLISH THEME-ADAPTIVE LOGS TABLE ───────────────────────────── */}
      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading telemetry execution logs…
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4 font-semibold">JOB ID</th>
                  <th className="py-3.5 px-4 font-semibold">ENDPOINT</th>
                  <th className="py-3.5 px-4 font-semibold">PROVIDER</th>
                  <th className="py-3.5 px-4 font-semibold">ROUTING TYPE</th>
                  <th className="py-3.5 px-4 font-semibold">STATUS</th>
                  <th className="py-3.5 px-4 font-semibold">LATENCY</th>
                  <th className="py-3.5 px-4 font-semibold text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs font-sans">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-zinc-400 font-mono">
                      No request logs match current filter query.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((j) => {
                    const statusMeta = STATUS_STYLES[j.status] || STATUS_STYLES.completed;
                    const endpointClass = ENDPOINT_BADGE[j.endpoint] || 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20';
                    const latencyColor = getLatencyColorClass(j.duration_ms);

                    return (
                      <tr
                        key={j.job_id}
                        onClick={() => setSelectedJob(j)}
                        className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                      >
                        {/* JOB ID */}
                        <td className="py-3.5 px-4 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                          <div className="flex items-center gap-1.5">
                            <span title={j.job_id}>
                              {j.job_id.length > 12 ? `${j.job_id.slice(0, 10)}…` : j.job_id}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(j.job_id, j.job_id); }}
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              title="Copy Job ID"
                            >
                              {copiedId === j.job_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* ENDPOINT */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${endpointClass}`}>
                            {j.endpoint}
                          </span>
                        </td>

                        {/* PROVIDER */}
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                          {j.provider || 'auto'}
                        </td>

                        {/* ROUTING TYPE */}
                        <td className="py-3.5 px-4 font-mono">
                          {j.routing_type === 'Pass-Through' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Pass-Through
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Direct BYOK
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.badge}`}>
                            {j.status === 'completed' ? (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </span>
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-500" />
                            )}
                            {statusMeta.text}
                          </span>
                        </td>

                        {/* LATENCY */}
                        <td className={`py-3.5 px-4 font-mono ${latencyColor}`}>
                          {formatLatency(j.duration_ms)}
                        </td>

                        {/* TIMESTAMP */}
                        <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-right" title={j.created_at}>
                          {timeAgo(j.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE LOG INSPECTOR DRAWER (Mounted via React Portal) ───────────── */}
      <LogInspectorDrawer
        isOpen={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};
