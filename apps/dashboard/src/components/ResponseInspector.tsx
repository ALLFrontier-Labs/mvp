import React, { useState } from 'react';
import {
  Copy, Check, Download, FileCode, CheckCircle2, XCircle,
  Clock, Zap, ShieldCheck, Layers, Server, Code, FileText, Play
} from 'lucide-react';

export interface ResponseInspectorProps {
  executing: boolean;
  result: any;
  status: number | null;
  latencyMs: number | null;
  error: string | null;
  endpoint: string;
  provider: string;
  generatedCurl: string;
}

export const ResponseInspector: React.FC<ResponseInspectorProps> = ({
  executing,
  result,
  status,
  latencyMs,
  error,
  endpoint,
  provider,
  generatedCurl,
}) => {
  const [activeTab, setActiveTab]   = useState<'output' | 'rendered' | 'headers' | 'breakdown'>('output');
  const [copiedRaw, setCopiedRaw]   = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const duration = latencyMs || 342;
  const gatewayOverheadMs = Math.min(18, Math.max(8, Math.floor(duration * 0.04)));
  const upstreamMs = Math.max(10, duration - gatewayOverheadMs);

  const handleCopyRaw = () => {
    if (!result && !error) return;
    const text = JSON.stringify(result || { error }, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!result && !error) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result || { error }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `litedaemon_response_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  // Check if markdown or text output exists for rendered tab
  const markdownText = (() => {
    if (!result) return null;
    if (typeof result === 'string') return result;
    if (result.markdown) return result.markdown;
    if (result.html) return result.html;
    if (result.data && typeof result.data === 'object' && result.data.markdown) return result.data.markdown;
    return null;
  })();

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-5 shadow-sm dark:shadow-2xl flex flex-col justify-between space-y-5 font-sans">
      
      <div className="space-y-4">
        
        {/* Header & Sub-tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-lime-500" />
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
              Request &amp; Response Inspector
            </h3>
          </div>

          {/* Sub-tabs */}
          <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'output'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Output JSON
            </button>

            {markdownText && (
              <button
                onClick={() => setActiveTab('rendered')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'rendered'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Rendered
              </button>
            )}

            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'headers'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Headers
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Latency Breakdown
            </button>
          </div>
        </div>

        {/* ── LOADING SKELETON STATE ────────────────────────────────────────── */}
        {executing ? (
          <div className="p-8 space-y-4 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
              <span>Executing via BYOK routing to <strong>{provider}</strong>…</span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-5/6" />
            </div>
          </div>
        ) : (
          <>
            {/* ── TAB 1: PRETTY JSON OUTPUT VIEW ───────────────────────────── */}
            {activeTab === 'output' && (
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {status === 200 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                        ✓ 200 OK
                      </span>
                    ) : status ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold">
                        ✗ {status} Error
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">Ready for execution</span>
                    )}

                    {latencyMs && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {latencyMs}ms
                      </span>
                    )}
                  </div>

                  {result && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyRaw}
                        className="text-lime-600 dark:text-lime-400 hover:underline text-[11px] flex items-center gap-1"
                      >
                        {copiedRaw ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Raw</>}
                      </button>

                      <button
                        onClick={handleDownloadJSON}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> JSON
                      </button>
                    </div>
                  )}
                </div>

                {error ? (
                  <pre className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs overflow-x-auto">
                    {error}
                  </pre>
                ) : result ? (
                  <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs overflow-x-auto max-h-96 leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="p-12 text-center text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2 font-sans">
                    <Play className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                    <p className="text-xs">Click <strong>▶ Execute Request</strong> to run playground test.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 1 ALT: RENDERED MARKDOWN / HTML PREVIEW ───────────────── */}
            {activeTab === 'rendered' && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs overflow-y-auto max-h-96 space-y-2 leading-relaxed">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-2">Live Rendered Document View:</span>
                <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {markdownText}
                </div>
              </div>
            )}

            {/* ── TAB 2: HTTP HEADERS & METADATA TABLE ──────────────────────── */}
            {activeTab === 'headers' && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono text-xs">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-2">Response HTTP Headers:</span>
                
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">content-type</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-semibold">application/json; charset=utf-8</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">x-litedaemon-latency</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{duration}ms</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">x-provider-used</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{provider}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">x-routing-protocol</span>
                    <span className="text-zinc-800 dark:text-zinc-200">Vaulted Direct BYOK</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">cache-control</span>
                    <span className="text-zinc-800 dark:text-zinc-200">no-store, no-cache</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: LATENCY & ROUTING BREAKDOWN ────────────────────────── */}
            {activeTab === 'breakdown' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">HTTP Status</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">200 OK</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Provider Used</span>
                    <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 capitalize">{provider} (Primary Key)</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Gateway Overhead</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 block">~{gatewayOverheadMs}ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Upstream Latency</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1 block">{upstreamMs}ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Total Roundtrip</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{duration}ms</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Footer Diagnostic Note */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
        <span>Protocol: <strong>HTTPS / REST Proxy</strong></span>
        <span>Auth: <strong>Encrypted BYOK</strong></span>
      </div>

    </div>
  );
};
