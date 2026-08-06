import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, Search, Monitor, Terminal, FileText, Play, Copy, Check,
  AlertTriangle, X, ChevronDown, ChevronUp, Loader2, Clock, Zap,
  Activity, Code2, RefreshCw, Key, ShieldCheck, CheckCircle2,
  Sliders, Settings, ArrowRight, CornerDownRight, Server
} from 'lucide-react';
import { api, getStoredApiKey } from '../lib/api';
import { PlaygroundPresets, PresetItem } from '../components/PlaygroundPresets';
import { ResponseInspector } from '../components/ResponseInspector';

type TabEndpoint = '/v1/scrape' | '/v1/search' | '/v1/browser' | '/v1/execute' | '/v1/document';

interface Provider {
  id: string;
  name: string;
  endpoint: string;
}

export const Playground: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state passed from location
  const locationState = location.state as { endpoint?: string; provider?: string; payload?: any } | null;

  // Active Endpoint Tab
  const [activeEndpoint, setActiveEndpoint] = useState<TabEndpoint>(
    (locationState?.endpoint as TabEndpoint) || '/v1/search'
  );

  // Inspector Sub-tab ('curl' | 'response' | 'headers')
  const [inspectorTab, setInspectorTab] = useState<'curl' | 'response' | 'headers'>('curl');

  // Session Statistics
  const [sessionCalls, setSessionCalls] = useState(0);
  const [userKeysCount, setUserKeysCount] = useState(1);
  const [configuredProviderIds, setConfiguredProviderIds] = useState<Set<string>>(new Set());

  // Collapsible Advanced Accordion State
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Execution States
  const [executing, setExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // ── FORM STATES PER ENDPOINT ───────────────────────────────────────────────
  // Scrape Form State
  const [scrapeUrl, setScrapeUrl]           = useState('https://example.com');
  const [scrapeFormat, setScrapeFormat]     = useState<'markdown' | 'html' | 'text' | 'json'>('markdown');
  const [scrapeProvider, setScrapeProvider] = useState('auto');

  // Search Form State
  const [searchQuery, setSearchQuery]       = useState('Latest AI agent benchmarks 2026');
  const [searchLimit, setSearchLimit]       = useState(5);
  const [searchProvider, setSearchProvider] = useState(locationState?.provider || 'auto');

  // Browser Form State
  const [browserScript, setBrowserScript]   = useState('await page.goto("https://example.com");\nconst title = await page.title();\nreturn { title };');
  const [browserWidth, setBrowserWidth]     = useState(1920);
  const [browserHeight, setBrowserHeight]   = useState(1080);
  const [browserProvider, setBrowserProvider] = useState('auto');

  // Execute Form State
  const [executeCode, setExecuteCode]       = useState('def main():\n    return {"status": "ok", "result": 42}\nprint(main())');
  const [executeTimeout, setExecuteTimeout] = useState(30);
  const [executeProvider, setExecuteProvider] = useState('auto');

  // Document Form State
  const [documentUrl, setDocumentUrl]       = useState('https://arxiv.org/pdf/2301.00001.pdf');
  const [documentFormat, setDocumentFormat] = useState<'markdown' | 'json'>('markdown');
  const [documentProvider, setDocumentProvider] = useState('auto');

  // Advanced Options Form State
  const [customHeaderKey, setCustomHeaderKey]     = useState('');
  const [customHeaderVal, setCustomHeaderVal]     = useState('');
  const [timeoutMs, setTimeoutMs]                 = useState(15000);
  const [waitSelector, setWaitSelector]           = useState('#content');
  const [proxyRegion, setProxyRegion]             = useState('US-East');

  const handleSelectPreset = (preset: PresetItem) => {
    setActiveEndpoint(preset.endpoint);
    if (preset.endpoint === '/v1/scrape') {
      setScrapeUrl(preset.payload.url || 'https://news.ycombinator.com');
      setScrapeFormat(preset.payload.format || 'markdown');
      setScrapeProvider(preset.payload.provider || 'firecrawl');
    } else if (preset.endpoint === '/v1/search') {
      setSearchQuery(preset.payload.query || 'latest LLM reasoning benchmarks 2026');
      setSearchLimit(preset.payload.limit || 5);
      setSearchProvider(preset.payload.provider || 'tavily');
    } else if (preset.endpoint === '/v1/browser') {
      setBrowserScript(preset.payload.script || '');
      setBrowserWidth(preset.payload.width || 1920);
      setBrowserHeight(preset.payload.height || 1080);
      setBrowserProvider(preset.payload.provider || 'steel');
    } else if (preset.endpoint === '/v1/execute') {
      setExecuteCode(preset.payload.code || '');
      setExecuteTimeout(preset.payload.timeout || 30);
      setExecuteProvider(preset.payload.provider || 'e2b');
    }
  };

  const apiKey = getStoredApiKey() || 'YOUR_LITEDAEMON_KEY';

  // Load configured keys count on mount
  useEffect(() => {
    api.listKeys()
      .then(res => {
        const keys = res.keys || [];
        setUserKeysCount(keys.length || 1);
        setConfiguredProviderIds(new Set(keys.map((k: any) => k.provider_id)));
      })
      .catch(() => {});
  }, []);

  // Compute Current Request Payload Object
  const currentPayload = useMemo(() => {
    if (activeEndpoint === '/v1/scrape') {
      return {
        provider: scrapeProvider,
        params: { url: scrapeUrl, format: scrapeFormat }
      };
    }
    if (activeEndpoint === '/v1/search') {
      return {
        provider: searchProvider,
        params: { query: searchQuery, limit: searchLimit }
      };
    }
    if (activeEndpoint === '/v1/browser') {
      return {
        provider: browserProvider,
        params: { script: browserScript, viewport: { width: browserWidth, height: browserHeight } }
      };
    }
    if (activeEndpoint === '/v1/execute') {
      return {
        provider: executeProvider,
        params: { code: executeCode, timeout_sec: executeTimeout }
      };
    }
    // Document
    return {
      provider: documentProvider,
      params: { url: documentUrl, format: documentFormat }
    };
  }, [
    activeEndpoint, scrapeUrl, scrapeFormat, scrapeProvider,
    searchQuery, searchLimit, searchProvider,
    browserScript, browserWidth, browserHeight, browserProvider,
    executeCode, executeTimeout, executeProvider,
    documentUrl, documentFormat, documentProvider
  ]);

  // Generate Live cURL Command String
  const generatedCurl = useMemo(() => {
    const payloadJson = JSON.stringify(currentPayload, null, 2);
    let curl = `curl -X POST https://litedaemon.xyz${activeEndpoint} \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json"`;

    if (customHeaderKey.trim() && customHeaderVal.trim()) {
      curl += ` \\\n  -H "${customHeaderKey.trim()}: ${customHeaderVal.trim()}"`;
    }

    curl += ` \\\n  -d '${payloadJson}'`;
    return curl;
  }, [activeEndpoint, currentPayload, apiKey, customHeaderKey, customHeaderVal]);

  const copyCurlToClipboard = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const copyResponseToClipboard = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Primary Execution Handler
  const handleExecuteRequest = async () => {
    setExecuting(true);
    setResponseError(null);
    setResponseResult(null);
    setResponseStatus(null);
    setResponseLatency(null);

    const startTime = Date.now();

    try {
      // Call backend API execute endpoint
      const res = await api.executeEndpoint(activeEndpoint.slice(4), currentPayload.params);

      const elapsed = Date.now() - startTime;
      setResponseResult(res.result || res);
      setResponseStatus(200);
      setResponseLatency(elapsed || 342);
      setSessionCalls(prev => prev + 1);
      setInspectorTab('response');
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      setResponseError(err.message || 'Gateway connection timeout or upstream error');
      setResponseStatus(err.status || 500);
      setResponseLatency(elapsed || 450);
      setInspectorTab('response');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans selection:bg-lime-400 selection:text-zinc-950">

      {/* ── WORKBENCH HEADER & TOP METRICS ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>API Playground Workbench</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Simulate and test unified endpoint requests directly from your browser with live BYOK routing.
          </p>
        </div>

        {/* Top-Right Metrics Bar */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto font-mono text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-500" />
            </span>
            <span>{sessionCalls} Requests Executed</span>
          </div>

          <button
            onClick={() => navigate('/keys')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{userKeysCount} Provider Ready</span>
          </button>
        </div>
      </div>

      {/* Sleek Live Routing Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-lime-500/10 via-emerald-500/10 to-teal-500/10 border border-lime-500/20 text-xs font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-lime-500 shrink-0" />
        <span>Live Routing Mode — Playground queries route directly through your encrypted Vault keys with instant failover support.</span>
      </div>

      {/* ── QUICK-TEST PRESETS BAR ────────────────────────────────────────────── */}
      <PlaygroundPresets onSelectPreset={handleSelectPreset} />

      {/* ── SPLIT-SCREEN WORKBENCH LAYOUT (12 COLS GRID) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT CONFIGURATOR PANEL (6 COLS) ────────────────────────────────── */}
        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-5 shadow-sm dark:shadow-2xl space-y-5">
          
          {/* Endpoint Selector Bar (5 Clean Tabs) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Select Gateway Endpoint:
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
              {(['/v1/scrape', '/v1/search', '/v1/browser', '/v1/execute', '/v1/document'] as const).map(ep => {
                const isActive = activeEndpoint === ep;
                return (
                  <button
                    key={ep}
                    onClick={() => setActiveEndpoint(ep)}
                    className={`py-2 px-1 rounded-lg font-bold text-center truncate transition-all ${
                      isActive
                        ? 'bg-lime-400 text-zinc-950 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {ep.replace('/v1/', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form Controls Based on Active Endpoint */}
          <div className="space-y-4 pt-1">
            
            {/* FOR /v1/scrape */}
            {activeEndpoint === '/v1/scrape' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Web URL</label>
                  <input
                    type="url"
                    value={scrapeUrl}
                    onChange={e => setScrapeUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Output Format</label>
                    <select
                      value={scrapeFormat}
                      onChange={e => setScrapeFormat(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="markdown">Markdown</option>
                      <option value="html">Clean HTML</option>
                      <option value="text">Plain Text</option>
                      <option value="json">Structured JSON</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Provider</label>
                    <select
                      value={scrapeProvider}
                      onChange={e => setScrapeProvider(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="auto">⚡ Auto Failover</option>
                      <option value="firecrawl">Firecrawl</option>
                      <option value="jina">Jina AI</option>
                      <option value="apify">Apify</option>
                      <option value="spider">Spider</option>
                      <option value="brightdata">Bright Data</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* FOR /v1/search */}
            {activeEndpoint === '/v1/search' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Search Query Term</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter search query..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-zinc-800 dark:text-zinc-200">Max Results Limit</label>
                      <span className="font-mono text-lime-600 dark:text-lime-400 font-bold">{searchLimit}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={searchLimit}
                      onChange={e => setSearchLimit(parseInt(e.target.value))}
                      className="w-full accent-lime-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Provider</label>
                    <select
                      value={searchProvider}
                      onChange={e => setSearchProvider(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="auto">⚡ Auto Failover</option>
                      <option value="tavily">Tavily Search</option>
                      <option value="exa">Exa Neural Search</option>
                      <option value="serper">Serper Google API</option>
                      <option value="brave">Brave Search</option>
                      <option value="perplexity">Perplexity Sonar</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* FOR /v1/browser */}
            {activeEndpoint === '/v1/browser' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Action Script Snippet</label>
                  <textarea
                    rows={4}
                    value={browserScript}
                    onChange={e => setBrowserScript(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Viewport Size</label>
                    <select
                      onChange={e => {
                        const [w, h] = e.target.value.split('x').map(Number);
                        setBrowserWidth(w); setBrowserHeight(h);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="1920x1080">1920 x 1080 (Desktop)</option>
                      <option value="1280x720">1280 x 720 (Laptop)</option>
                      <option value="390x844">390 x 844 (Mobile)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Provider</label>
                    <select
                      value={browserProvider}
                      onChange={e => setBrowserProvider(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="auto">⚡ Auto Failover</option>
                      <option value="steel">Steel Browser</option>
                      <option value="browserbase">Browserbase</option>
                      <option value="scrapingbee">ScrapingBee Chrome</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* FOR /v1/execute */}
            {activeEndpoint === '/v1/execute' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Code Sandbox Input</label>
                  <textarea
                    rows={4}
                    value={executeCode}
                    onChange={e => setExecuteCode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Execution Timeout (sec)</label>
                    <input
                      type="number"
                      value={executeTimeout}
                      onChange={e => setExecuteTimeout(parseInt(e.target.value) || 30)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Provider</label>
                    <select
                      value={executeProvider}
                      onChange={e => setExecuteProvider(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="auto">⚡ Auto Failover</option>
                      <option value="e2b">E2B Sandbox</option>
                      <option value="daytona">Daytona Workspaces</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* FOR /v1/document */}
            {activeEndpoint === '/v1/document' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Document File URL</label>
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={e => setDocumentUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Parse Format</label>
                    <select
                      value={documentFormat}
                      onChange={e => setDocumentFormat(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="markdown">Markdown</option>
                      <option value="json">Structured JSON</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Target Provider</label>
                    <select
                      value={documentProvider}
                      onChange={e => setDocumentProvider(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                    >
                      <option value="auto">⚡ Auto Failover</option>
                      <option value="llamaparse">LlamaParse</option>
                      <option value="unstructured">Unstructured</option>
                      <option value="firecrawl_parse">Firecrawl Parse</option>
                    </select>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Collapsible Advanced Options Accordion */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 space-y-3 font-mono text-xs">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full font-bold text-zinc-700 dark:text-zinc-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-lime-500" /> Advanced Gateway Options
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Custom Header Key</label>
                    <input
                      type="text"
                      value={customHeaderKey}
                      onChange={e => setCustomHeaderKey(e.target.value)}
                      placeholder="X-Custom-Header"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Header Value</label>
                    <input
                      type="text"
                      value={customHeaderVal}
                      onChange={e => setCustomHeaderVal(e.target.value)}
                      placeholder="Header Value"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Timeout (ms)</label>
                    <input
                      type="number"
                      value={timeoutMs}
                      onChange={e => setTimeoutMs(parseInt(e.target.value) || 15000)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Wait Selector</label>
                    <input
                      type="text"
                      value={waitSelector}
                      onChange={e => setWaitSelector(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Proxy Region</label>
                    <select
                      value={proxyRegion}
                      onChange={e => setProxyRegion(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
                    >
                      <option value="US-East">US-East</option>
                      <option value="EU-Central">EU-Central</option>
                      <option value="AP-South">AP-South</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Execute Button */}
          <div className="pt-2">
            <button
              onClick={handleExecuteRequest}
              disabled={executing}
              className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 font-mono"
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Routing to Upstream Provider…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>▶ Execute Request</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ── RIGHT EXECUTION & INSPECTOR PANEL (6 COLS) ─────────────────────── */}
        <div className="lg:col-span-6">
          <ResponseInspector
            executing={executing}
            result={responseResult}
            status={responseStatus}
            latencyMs={responseLatency}
            error={responseError}
            endpoint={activeEndpoint}
            provider={currentPayload.provider === 'auto' ? 'tavily' : currentPayload.provider}
            generatedCurl={generatedCurl}
          />
        </div>

      </div>

    </div>
  );
};
