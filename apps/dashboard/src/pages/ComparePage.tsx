import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { getToolBySlug, getComparePresetsForTool, getRelatedTools, TOOL_REGISTRY } from '../lib/services/tool-service';
import { GitCompare, ArrowLeft, Check, Zap, Server, ShieldCheck, DollarSign } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  let slug = params.slug || '';
  if (!slug) {
    slug = location.pathname.replace(/^\/compare\//, '');
  }

  const primaryTool = getToolBySlug(slug) || getToolBySlug('serper/google-search');

  if (!primaryTool) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans px-6 py-20 text-center space-y-4">
        <div className="text-4xl font-extrabold text-white">Compare Target Not Found</div>
        <p className="text-zinc-400 text-sm font-mono">
          No tool engine registered matching <code className="text-yellow-400 font-mono">{slug}</code>.
        </p>
        <Link to="/providers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-mono">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Providers
        </Link>
      </div>
    );
  }

  const presets = getComparePresetsForTool(primaryTool);
  const relatedTools = getRelatedTools(primaryTool.slug);
  const comparisonTools = [primaryTool, ...relatedTools].slice(0, 3);

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back Link & Header */}
        <div className="space-y-3">
          <Link to={`/tools/${primaryTool.slug}`} className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {primaryTool.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Compare {primaryTool.name} Alternatives
              </h1>
              <p className="text-zinc-400 text-xs font-mono mt-0.5">
                Benchmark side-by-side latency, pricing, throughput RPS, and uptime SLA across {primaryTool.category} engines.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-2">
              <span className="text-xs font-bold text-lime-400 font-mono uppercase tracking-wider">{p.title}</span>
              <p className="text-xs text-zinc-300 font-sans">{p.description}</p>
              <div className="pt-2 flex flex-wrap gap-1 font-mono text-[11px]">
                {p.toolSlugs.map((s) => (
                  <Link key={s} to={`/compare/${s}`} className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Side-by-Side Comparison Matrix Table */}
        <div className="border border-zinc-800/80 rounded-2xl bg-[#0d0d0e] overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-xs text-zinc-300 font-mono">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-bold">Metric / Feature</th>
                {comparisonTools.map((t) => (
                  <th key={t.id} className="px-6 py-4 font-bold text-white font-sans text-sm">
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Category</td>
                {comparisonTools.map((t) => (
                  <td key={t.id} className="px-6 py-4 text-emerald-400 font-bold">{t.category}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Pricing Summary</td>
                {comparisonTools.map((t) => (
                  <td key={t.id} className="px-6 py-4 text-yellow-400 font-bold">{t.pricingSummary}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Max Concurrency</td>
                {comparisonTools.map((t) => (
                  <td key={t.id} className="px-6 py-4 text-white font-bold">{t.maxConcurrency}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Avg Latency (ms)</td>
                {comparisonTools.map((t) => {
                  const avgLat = (t.endpoints.reduce((acc, ep) => acc + ep.avgLatencyMs, 0) / Math.max(1, t.endpoints.length)).toFixed(0);
                  return (
                    <td key={t.id} className="px-6 py-4 text-white font-bold">{avgLat}ms</td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Uptime SLA</td>
                {comparisonTools.map((t) => {
                  const avgUp = (t.endpoints.reduce((acc, ep) => acc + ep.uptimePercentage, 0) / Math.max(1, t.endpoints.length)).toFixed(2);
                  return (
                    <td key={t.id} className="px-6 py-4 text-lime-400 font-bold">{avgUp}%</td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Modalities (In → Out)</td>
                {comparisonTools.map((t) => (
                  <td key={t.id} className="px-6 py-4 text-zinc-300 text-[11px]">
                    {t.modalities.inputs.join(', ')} → {t.modalities.outputs.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-sans text-zinc-400">Actions</td>
                {comparisonTools.map((t) => (
                  <td key={t.id} className="px-6 py-4">
                    <Link
                      to={`/tools/${t.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-[#ccff00] text-black font-extrabold text-xs inline-block"
                    >
                      View Detail
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ComparePage;
