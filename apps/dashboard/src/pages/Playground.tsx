import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  Monitor,
  Terminal,
  FileText,
  Play,
  Copy,
  Check,
  AlertTriangle,
  X,
  ChevronDown,
  Loader2,
  Clock,
  Zap,
  DollarSign,
  Activity,
  Code2,
  RefreshCw,
  Trash2,
  ChevronUp,
  Key,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api, getStoredApiKey } from '../lib/api';
import { PROVIDER_META } from '../data/providers';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Provider {
  id: string;
  name: string;
  endpoint: string;
  adapter_type: string;
  cost_per_call_usd: number;
  is_live: boolean;
}

interface LogEntry {
  id: string;
  tab: string;
  provider: string;
  status: number;
  latency_ms: number;
  cost_usd: number;
  request: Record<string, any>;
  response: any;
  ts: Date;
  error?: string;
  expanded: boolean;
  copied: boolean;
}

type TabId = 'scrape' | 'search' | 'browser' | 'execute' | 'document';

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.FC<any>; color: string; glow: string }[] = [
  { id: 'scrape',   label: 'Scrape',   icon: Globe,     color: 'emerald', glow: 'shadow-emerald-500/20' },
  { id: 'search',   label: 'Search',   icon: Search,    color: 'teal',    glow: 'shadow-teal-500/20' },
  { id: 'browser',  label: 'Browser',  icon: Monitor,   color: 'cyan',    glow: 'shadow-cyan-500/20' },
  { id: 'execute',  label: 'Execute',  icon: Terminal,  color: 'purple',  glow: 'shadow-purple-500/20' },
  { id: 'document', label: 'Document', icon: FileText,  color: 'amber',   glow: 'shadow-amber-500/20' },
];

const TAB_COLORS: Record<string, { active: string; badge: string; btn: string; text: string; border: string }> = {
  scrape:   { active: 'bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-500',  badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  search:   { active: 'bg-teal-500/10 text-teal-300 border-b-2 border-teal-500',          badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',           btn: 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/25',         text: 'text-teal-400',    border: 'border-teal-500/30' },
  browser:  { active: 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500',          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',           btn: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25',         text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  execute:  { active: 'bg-purple-500/10 text-purple-300 border-b-2 border-purple-500',    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',     btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',   text: 'text-purple-400',  border: 'border-purple-500/30' },
  document: { active: 'bg-amber-500/10 text-amber-300 border-b-2 border-amber-500',       badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',         btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25',       text: 'text-amber-400',   border: 'border-amber-500/30' },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all ${props.className ?? ''}`}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full appearance-none bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all pr-9 ${props.className ?? ''}`}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
  </div>
);

// ── Dynamic Provider Selector with Key Connection State ───────────────────────
const ProviderSelect: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  endpoint: TabId;
  value: string;
  onChange: (v: string) => void;
}> = ({ providers, configuredProviderIds, endpoint, value, onChange }) => {
  const filtered = providers.filter((p) => p.endpoint === endpoint);
  const selected = filtered.find((p) => p.id === value);
  const selectedHasKey = selected ? configuredProviderIds.has(selected.id) : true;

  return (
    <div>
      <Label>Provider</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="auto">⚡ Auto (Primary + Fallback Chain)</option>
        {filtered.map((p) => {
          const hasKey = configuredProviderIds.has(p.id);
          return (
            <option key={p.id} value={p.id} disabled={!hasKey}>
              {p.name} {hasKey ? '(Connected)' : '(Key Required)'}
            </option>
          );
        })}
      </Select>
      
      {value !== 'auto' && selected && (
        <div className="mt-1.5 text-xs font-mono">
          {selectedHasKey ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              BYOK Key Active — 0% Gateway Markup
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              BYOK Key Required — <Link to="/keys" className="underline hover:text-amber-300">Add key in Keys tab</Link>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Run Button ────────────────────────────────────────────────────────────────
const RunButton: React.FC<{
  tab: TabId;
  loading: boolean;
  onClick: () => void;
}> = ({ tab, loading, onClick }) => {
  const c = TAB_COLORS[tab];
  return (
    <button
      id={`playground-run-${tab}`}
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${c.btn}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Play className="w-4 h-4 fill-white/70" />
      )}
      {loading ? 'Running…' : 'Run Request'}
    </button>
  );
};

// ── Log Entry Card ────────────────────────────────────────────────────────────
const LogCard: React.FC<{
  entry: LogEntry;
  onToggle: (id: string) => void;
  onCopy: (id: string) => void;
}> = ({ entry, onToggle, onCopy }) => {
  const c = TAB_COLORS[entry.tab as TabId] ?? TAB_COLORS.scrape;
  const isOk = entry.status >= 200 && entry.status < 300;

  return (
    <div className={`rounded-xl border ${isOk ? 'border-slate-700/60' : 'border-rose-500/30'} bg-slate-900/60 overflow-hidden`}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
        onClick={() => onToggle(entry.id)}
      >
        {/* Status pill */}
        <span
          className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
            isOk ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {entry.status === 0 ? '500 ERR' : `${entry.status} ${isOk ? 'OK' : ''}`}
        </span>

        {/* Endpoint badge */}
        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold border ${c.badge}`}>
          /v1/{entry.tab}
        </span>

        {/* Provider */}
        <span className="text-xs text-slate-300 font-mono truncate flex-1">
          Routed via {entry.provider} BYOK
        </span>

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-teal-400" />{entry.latency_ms}ms</span>
          <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3" />Direct BYOK</span>
          <span className="text-slate-600">{timeAgo(entry.ts)}</span>
        </div>

        {/* Expand chevron */}
        {entry.expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </div>

      {/* Expanded body */}
      {entry.expanded && (
        <div className="border-t border-slate-800/60 px-4 py-4 space-y-4">
          <div className="flex sm:hidden items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-teal-400" />{entry.latency_ms}ms</span>
            <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3" />Direct BYOK</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Request */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Request Payload</p>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950/60 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap max-h-56 overflow-y-auto border border-slate-800/60">
                {JSON.stringify(entry.request, null, 2)}
              </pre>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Response JSON</p>
                <button
                  onClick={() => onCopy(entry.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                >
                  {entry.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {entry.copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950/60 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap max-h-56 overflow-y-auto border border-slate-800/60">
                {JSON.stringify(entry.response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tab Forms ─────────────────────────────────────────────────────────────────

// Scrape Form
const ScrapeForm: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  onRun: (provider: string, params: any) => void;
  loading: boolean;
}> = ({ providers, configuredProviderIds, onRun, loading }) => {
  const [url, setUrl] = useState('https://example.com');
  const [format, setFormat] = useState<'markdown' | 'html' | 'text'>('markdown');
  const [provider, setProvider] = useState('auto');

  return (
    <div className="space-y-5">
      <div>
        <Label>Target URL</Label>
        <Input
          id="scrape-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label>Output Format</Label>
        <div className="flex gap-2">
          {(['markdown', 'html', 'text'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                format === f
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ProviderSelect
        providers={providers}
        configuredProviderIds={configuredProviderIds}
        endpoint="scrape"
        value={provider}
        onChange={setProvider}
      />

      <RunButton
        tab="scrape"
        loading={loading}
        onClick={() => onRun(provider, { url, format })}
      />
    </div>
  );
};

// Search Form
const SearchForm: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  onRun: (provider: string, params: any) => void;
  loading: boolean;
}> = ({ providers, configuredProviderIds, onRun, loading }) => {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'basic' | 'advanced'>('basic');
  const [maxResults, setMaxResults] = useState(5);
  const [provider, setProvider] = useState('auto');

  return (
    <div className="space-y-5">
      <div>
        <Label>Search Query</Label>
        <Input
          id="search-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. latest AI agent benchmarks 2026"
        />
      </div>

      <div>
        <Label>Search Depth</Label>
        <div className="flex gap-2">
          {(['basic', 'advanced'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                depth === d
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {d === 'basic' ? 'Basic (Fast)' : 'Advanced (Deep Grounding)'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Max Results: <span className="text-slate-200 font-mono">{maxResults}</span></Label>
        <input
          id="search-max-results"
          type="range"
          min={1}
          max={20}
          value={maxResults}
          onChange={(e) => setMaxResults(Number(e.target.value))}
          className="w-full h-1.5 rounded-full accent-teal-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      <ProviderSelect
        providers={providers}
        configuredProviderIds={configuredProviderIds}
        endpoint="search"
        value={provider}
        onChange={setProvider}
      />

      <RunButton
        tab="search"
        loading={loading}
        onClick={() => onRun(provider, { query, depth, max_results: maxResults })}
      />
    </div>
  );
};

// Browser Form
const BrowserForm: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  onRun: (provider: string, params: any) => void;
  loading: boolean;
}> = ({ providers, configuredProviderIds, onRun, loading }) => {
  const [url, setUrl] = useState('https://example.com');
  const [viewport, setViewport] = useState<'1280x800' | '1920x1080'>('1280x800');
  const [stealth, setStealth] = useState(true);
  const [provider, setProvider] = useState('auto');

  return (
    <div className="space-y-5">
      <div>
        <Label>Target URL</Label>
        <Input
          id="browser-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Viewport Size</Label>
          <Select value={viewport} onChange={(e: any) => setViewport(e.target.value)}>
            <option value="1280x800">1280 × 800 (Laptop)</option>
            <option value="1920x1080">1920 × 1080 (Desktop)</option>
          </Select>
        </div>
        <div>
          <Label>Stealth Anti-Detect</Label>
          <button
            type="button"
            onClick={() => setStealth(!stealth)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
              stealth
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            {stealth ? 'Stealth ON' : 'Stealth OFF'}
          </button>
        </div>
      </div>

      <ProviderSelect
        providers={providers}
        configuredProviderIds={configuredProviderIds}
        endpoint="browser"
        value={provider}
        onChange={setProvider}
      />

      <RunButton
        tab="browser"
        loading={loading}
        onClick={() => onRun(provider, { url, viewport, stealth })}
      />
    </div>
  );
};

// Execute Form
const ExecuteForm: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  onRun: (provider: string, params: any) => void;
  loading: boolean;
}> = ({ providers, configuredProviderIds, onRun, loading }) => {
  const [code, setCode] = useState(`# Python 3.10 Sandbox\nimport json\n\ndata = {"status": "success", "message": "Executed inside LiteDaemon sandbox!"}\nprint(json.dumps(data, indent=2))`);
  const [runtime, setRuntime] = useState<'python3.10' | 'node18'>('python3.10');
  const [provider, setProvider] = useState('auto');

  const SNIPPETS = {
    'python3.10': `# Python 3.10 Sandbox\nimport json\n\ndata = {"status": "success", "message": "Executed inside LiteDaemon sandbox!"}\nprint(json.dumps(data, indent=2))`,
    'node18': `// Node.js 18 Sandbox\nconst data = { status: "success", message: "Executed inside LiteDaemon sandbox!" };\nconsole.log(JSON.stringify(data, null, 2));`,
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Execution Runtime</Label>
        <div className="flex gap-2">
          {[
            { id: 'python3.10', label: 'Python 3.10' },
            { id: 'node18',     label: 'Node.js 18' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRuntime(r.id as any);
                setCode(SNIPPETS[r.id as keyof typeof SNIPPETS]);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                runtime === r.id
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Code Snippet</Label>
        <div className="relative rounded-xl overflow-hidden border border-slate-700/60">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border-b border-slate-800/60">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-2 text-xs font-mono text-slate-600">sandbox.{runtime.startsWith('python') ? 'py' : 'js'}</span>
            <Code2 className="ml-auto w-3.5 h-3.5 text-slate-600" />
          </div>
          <textarea
            id="execute-code"
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-950/60 px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      <ProviderSelect
        providers={providers}
        configuredProviderIds={configuredProviderIds}
        endpoint="execute"
        value={provider}
        onChange={setProvider}
      />

      <RunButton
        tab="execute"
        loading={loading}
        onClick={() => onRun(provider, { code, runtime })}
      />
    </div>
  );
};

// Document Form
const DocumentForm: React.FC<{
  providers: Provider[];
  configuredProviderIds: Set<string>;
  onRun: (provider: string, params: any) => void;
  loading: boolean;
}> = ({ providers, configuredProviderIds, onRun, loading }) => {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [fileUrl, setFileUrl] = useState('');
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [provider, setProvider] = useState('auto');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileB64, setFileB64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileB64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Input Source</Label>
        <div className="flex gap-2">
          {(['url', 'upload'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                mode === m
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {m === 'url' ? '🔗 File URL' : '📁 Upload File'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'url' ? (
        <div>
          <Label>File URL (PDF, DOCX, XLSX)</Label>
          <Input
            id="document-url"
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/document.pdf"
          />
        </div>
      ) : (
        <div>
          <Label>Upload File</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 hover:border-slate-600 cursor-pointer transition-all"
          >
            <FileText className={`w-7 h-7 ${fileName ? 'text-amber-400' : 'text-slate-600'}`} />
            {fileName ? (
              <p className="text-xs font-medium text-amber-300">{fileName}</p>
            ) : (
              <p className="text-xs text-slate-400">Click to upload PDF, DOCX, or XLSX</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.txt,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>
      )}

      <div>
        <Label>Output Format</Label>
        <div className="flex gap-2">
          {(['markdown', 'json'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                format === f
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {f === 'json' ? 'Structured JSON' : 'Markdown'}
            </button>
          ))}
        </div>
      </div>

      <ProviderSelect
        providers={providers}
        configuredProviderIds={configuredProviderIds}
        endpoint="document"
        value={provider}
        onChange={setProvider}
      />

      <RunButton
        tab="document"
        loading={loading}
        onClick={() => {
          const params: any = { format };
          if (mode === 'url') params.file_url = fileUrl;
          else if (fileB64) params.file_b64 = fileB64;
          onRun(provider, params);
        }}
      />
    </div>
  );
};

// ── Main Playground Page ──────────────────────────────────────────────────────
export const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('scrape');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userKeys, setUserKeys]     = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [log, setLog]               = useState<LogEntry[]>([]);
  const [running, setRunning]       = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(() =>
    localStorage.getItem('ld_playground_warning_dismissed') === '1'
  );

  // Load providers and BYOK keys
  useEffect(() => {
    Promise.all([
      api.listProviders().catch(() => ({ providers: [] })),
      api.listKeys().catch(() => ({ keys: [] })),
    ]).then(([provData, keysData]) => {
      let loadedProviders: Provider[] = provData.providers ?? [];
      
      // If backend returned fewer providers, build fallback list from PROVIDER_META
      if (loadedProviders.length === 0) {
        loadedProviders = Object.entries(PROVIDER_META).map(([id, meta]) => {
          let ep = 'scrape';
          if (['tavily', 'serper', 'exa', 'brave', 'serpapi', 'bing', 'google_cse', 'zenserp', 'you', 'perplexity', 'searxng'].includes(id)) ep = 'search';
          else if (['browserbase', 'steel', 'browserless', 'anchor'].includes(id)) ep = 'browser';
          else if (['e2b', 'daytona', 'modal', 'fly', 'runpod'].includes(id)) ep = 'execute';
          else if (['llamaparse', 'unstructured', 'firecrawl_parse', 'diffbot'].includes(id)) ep = 'document';
          return {
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' '),
            endpoint: ep,
            adapter_type: id,
            cost_per_call_usd: 0.002,
            is_live: true,
          };
        });
      }
      setProviders(loadedProviders);
      setUserKeys(keysData.keys ?? []);
    }).finally(() => setProvidersLoading(false));
  }, []);

  const configuredProviderIds = useMemo(() => new Set(userKeys.map(k => k.provider_id)), [userKeys]);

  const dismissWarning = () => {
    localStorage.setItem('ld_playground_warning_dismissed', '1');
    setWarningDismissed(true);
  };

  // Core run function — calls real backend
  const handleRun = useCallback(async (endpoint: TabId, provider: string, params: Record<string, any>) => {
    const apiKey = getStoredApiKey();
    if (!apiKey) return;

    setRunning(true);
    const reqPayload = { provider, params };
    const startTs = Date.now();
    let httpStatus = 0;
    let responseData: any = null;

    try {
      const res = await fetch(`https://mvp-production-c1e8.up.railway.app/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(reqPayload),
      });

      httpStatus = res.status;
      try { responseData = await res.json(); } catch { responseData = { error: 'Non-JSON response' }; }

      const latency = Date.now() - startTs;
      const cost = responseData?.cost_usd ?? 0;
      const resolvedProvider = responseData?.provider ?? provider;

      setLog((prev) => [
        {
          id: uid(),
          tab: endpoint,
          provider: resolvedProvider,
          status: httpStatus,
          latency_ms: latency,
          cost_usd: cost,
          request: reqPayload,
          response: responseData,
          ts: new Date(),
          expanded: true,
          copied: false,
          error: res.ok ? undefined : (responseData?.error ?? `HTTP ${httpStatus}`),
        },
        ...prev,
      ]);
    } catch (err: any) {
      const latency = Date.now() - startTs;
      setLog((prev) => [
        {
          id: uid(),
          tab: endpoint,
          provider: provider,
          status: 0,
          latency_ms: latency,
          cost_usd: 0,
          request: reqPayload,
          response: { error: err.message },
          ts: new Date(),
          expanded: true,
          copied: false,
          error: err.message,
        },
        ...prev,
      ]);
    } finally {
      setRunning(false);
    }
  }, []);

  const toggleExpand = (id: string) =>
    setLog((prev) => prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)));

  const copyEntry = (id: string) => {
    const entry = log.find((e) => e.id === id);
    if (!entry) return;
    navigator.clipboard.writeText(JSON.stringify(entry.response, null, 2)).catch(() => {});
    setLog((prev) => prev.map((e) => (e.id === id ? { ...e, copied: true } : e)));
    setTimeout(() => setLog((prev) => prev.map((e) => (e.id === id ? { ...e, copied: false } : e))), 2000);
  };

  const clearLog = () => setLog([]);

  const c = TAB_COLORS[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/60 border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 text-white fill-white/30" />
            </div>
            API Playground
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Test all 5 unified endpoints directly from your browser using your connected BYOK keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs font-mono text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            {log.length} calls this session
          </div>
          {log.length > 0 && (
            <button
              onClick={clearLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/40 hover:border-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear log
            </button>
          )}
        </div>
      </div>

      {/* ── BYOK Gateway Banner ───────────────────────────────── */}
      {!warningDismissed && (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300">Pure BYOK Gateway Execution</p>
            <p className="text-xs text-emerald-400/80 mt-0.5 leading-relaxed">
              Live Execution: Playground requests route directly through your connected BYOK provider keys.
            </p>
          </div>
          <button
            onClick={dismissWarning}
            className="shrink-0 p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Main Workbench ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">

        {/* LEFT — Tab form panel */}
        <div className="space-y-0">
          {/* Endpoint tabs */}
          <div className="flex border-b border-slate-800/60 bg-slate-900/40 rounded-t-2xl overflow-hidden">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`playground-tab-${t.id}`}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? TAB_COLORS[t.id].active
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form body */}
          <div className={`bg-slate-900/60 border border-t-0 ${c.border} rounded-b-2xl p-5`}>
            {providersLoading ? (
              <div className="flex items-center justify-center h-40 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading providers…</span>
              </div>
            ) : (
              <>
                {activeTab === 'scrape' && (
                  <ScrapeForm
                    providers={providers}
                    configuredProviderIds={configuredProviderIds}
                    onRun={(p, params) => handleRun('scrape', p, params)}
                    loading={running}
                  />
                )}
                {activeTab === 'search' && (
                  <SearchForm
                    providers={providers}
                    configuredProviderIds={configuredProviderIds}
                    onRun={(p, params) => handleRun('search', p, params)}
                    loading={running}
                  />
                )}
                {activeTab === 'browser' && (
                  <BrowserForm
                    providers={providers}
                    configuredProviderIds={configuredProviderIds}
                    onRun={(p, params) => handleRun('browser', p, params)}
                    loading={running}
                  />
                )}
                {activeTab === 'execute' && (
                  <ExecuteForm
                    providers={providers}
                    configuredProviderIds={configuredProviderIds}
                    onRun={(p, params) => handleRun('execute', p, params)}
                    loading={running}
                  />
                )}
                {activeTab === 'document' && (
                  <DocumentForm
                    providers={providers}
                    configuredProviderIds={configuredProviderIds}
                    onRun={(p, params) => handleRun('document', p, params)}
                    loading={running}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Execution log */}
        <div className="space-y-3">
          {/* Log header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin text-emerald-400' : 'text-slate-600'}`} />
              Execution Log
            </h2>
            <span className="text-xs text-slate-600 font-mono">Latest first</span>
          </div>

          {/* Log entries */}
          {log.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 h-64 rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/30">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">No calls yet</p>
                <p className="text-xs text-slate-600 mt-1">Configure a request and click <strong className="text-slate-400">Run</strong> to see results here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {log.map((entry) => (
                <LogCard
                  key={entry.id}
                  entry={entry}
                  onToggle={toggleExpand}
                  onCopy={copyEntry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
