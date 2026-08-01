import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Terminal, Play, Copy, Check, Loader2, ShieldCheck, Key, Zap, ArrowRight, Code
} from 'lucide-react';
import { api } from '../lib/api';

export interface EndpointDrawerProps {
  isOpen: boolean;
  endpoint: string | null;
  onClose: () => void;
  activeKeyCount?: number;
}

export const EndpointDrawer: React.FC<EndpointDrawerProps> = ({
  isOpen,
  endpoint,
  onClose,
  activeKeyCount = 0,
}) => {
  const navigate = useNavigate();

  // Endpoint metadata map
  const meta = (() => {
    switch (endpoint) {
      case '/v1/scrape':
        return {
          title: '/v1/scrape',
          category: 'Web Scraping & Extraction',
          providers: ['firecrawl', 'jina', 'apify', 'spider'],
          defaultProvider: 'auto',
          defaultInput: 'https://example.com',
          inputLabel: 'Target URL to Scrape',
          apiMethod: (p: string, val: string) => api.scrape(p, { url: val }),
          sampleSnippet: `curl -X POST https://gateway.litedaemon.com/v1/scrape \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -d '{"provider":"auto","params":{"url":"https://example.com"}}'`,
        };
      case '/v1/document':
        return {
          title: '/v1/document',
          category: 'Document Parsing & AI Extraction',
          providers: ['auto', 'llama_parse'],
          defaultProvider: 'auto',
          defaultInput: 'https://arxiv.org/pdf/2401.00001.pdf',
          inputLabel: 'Document URL to Parse',
          apiMethod: (p: string, val: string) => api.document(p, { url: val }),
          sampleSnippet: `curl -X POST https://gateway.litedaemon.com/v1/document \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -d '{"provider":"auto","params":{"url":"https://example.com/doc.pdf"}}'`,
        };
      case '/v1/browser':
        return {
          title: '/v1/browser',
          category: 'Cloud Browser Automation',
          providers: ['browserbase', 'steel'],
          defaultProvider: 'auto',
          defaultInput: 'https://news.ycombinator.com',
          inputLabel: 'Initial Browser Session URL',
          apiMethod: (p: string, val: string) => api.browser(p, { url: val }),
          sampleSnippet: `curl -X POST https://gateway.litedaemon.com/v1/browser \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -d '{"provider":"auto","params":{"url":"https://news.ycombinator.com"}}'`,
        };
      case '/v1/execute':
        return {
          title: '/v1/execute',
          category: 'Code Sandbox Execution',
          providers: ['e2b', 'daytona'],
          defaultProvider: 'e2b',
          defaultInput: "print('Hello from LiteDaemon E2B Sandbox!')",
          inputLabel: 'Python/JS Code Snippet to Execute',
          apiMethod: (p: string, val: string) => api.execute(p, { code: val }),
          sampleSnippet: `curl -X POST https://gateway.litedaemon.com/v1/execute \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -d '{"provider":"e2b","params":{"code":"print(\\"Hello Sandbox!\\")"}}'`,
        };
      case '/v1/search':
      default:
        return {
          title: '/v1/search',
          category: 'Unified Web Search',
          providers: ['tavily', 'exa', 'serper'],
          defaultProvider: 'auto',
          defaultInput: 'Latest AI Agent Frameworks 2026',
          inputLabel: 'Search Query',
          apiMethod: (p: string, val: string) => api.search(p, { query: val }),
          sampleSnippet: `curl -X POST https://gateway.litedaemon.com/v1/search \\\n  -H "Authorization: Bearer LITEDAEMON_MASTER_KEY" \\\n  -d '{"provider":"auto","params":{"query":"Latest AI Agent news"}}'`,
        };
    }
  })();

  const [selectedProvider, setSelectedProvider] = useState<string>(meta.defaultProvider);
  const [inputValue, setInputValue] = useState<string>(meta.defaultInput);
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    setSelectedProvider(meta.defaultProvider);
    setInputValue(meta.defaultInput);
    setResponseJson(null);
    setErrorMsg(null);
  }, [endpoint]);

  if (!isOpen || !endpoint) return null;

  const handleTestRequest = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResponseJson(null);
    try {
      const res = await meta.apiMethod(selectedProvider, inputValue);
      setResponseJson(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setErrorMsg(err.message || 'Test request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(responseJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfigureKey = () => {
    onClose();
    navigate('/keys');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Slide-Over Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-[100] h-screen w-full max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out dark:bg-zinc-950 light:bg-white light:border-zinc-200 font-sans">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-lime-600 dark:text-lime-400">
                {meta.title}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                activeKeyCount > 0 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}>
                {activeKeyCount > 0 ? `${activeKeyCount} Vaulted Key${activeKeyCount > 1 ? 's' : ''}` : 'Pass-Through'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              {meta.category} · Integrated: <strong className="text-zinc-800 dark:text-zinc-200 font-mono capitalize">{meta.providers.join(', ')}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* Vault & Failover Status */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300">
                {activeKeyCount > 0 ? 'Routing via personal encrypted BYOK keys' : 'Routing via LiteDaemon Master Pool'}
              </span>
            </div>
            <button
              onClick={handleConfigureKey}
              className="text-lime-600 dark:text-lime-400 font-bold hover:underline shrink-0 flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" /> Vault Key →
            </button>
          </div>

          {/* Quick Test Console Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-lime-500" /> Quick Test Console
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">Live API Execution</span>
            </div>

            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Target Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-lime-500 focus:outline-none capitalize"
              >
                <option value="auto">auto (Automated Failover &amp; Load Balancing)</option>
                {meta.providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Input Value */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                {meta.inputLabel}
              </label>
              {endpoint === '/v1/execute' ? (
                <textarea
                  rows={4}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-lime-500 focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:border-lime-500 focus:outline-none"
                />
              )}
            </div>

            {/* Execute Button */}
            <button
              onClick={handleTestRequest}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Executing Test Request...</>
              ) : (
                <><Play className="w-4 h-4 fill-zinc-950" /> Send Test Request →</>
              )}
            </button>
          </div>

          {/* Error Display */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400">
              ⚠️ Error: {errorMsg}
            </div>
          )}

          {/* Response Viewer */}
          {responseJson && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Response Data (JSON):</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-lime-600 dark:text-lime-400 hover:underline text-[11px]"
                >
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-64">
                {responseJson}
              </pre>
            </div>
          )}

          {/* Sample cURL Snippet */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block font-semibold">
              cURL Snippet:
            </span>
            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto">
              {meta.sampleSnippet}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center text-xs font-mono shrink-0">
          <span className="text-zinc-500">LiteDaemon Gateway Proxy v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-semibold"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </>
  );
};
