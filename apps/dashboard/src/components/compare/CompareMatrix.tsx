import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Plus, 
  ExternalLink, 
  Check, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  BarChart3 
} from 'lucide-react';
import { ToolDetail } from '../../types/tool-detail';
import { getAllTools, getComparePresetsForTool } from '../../lib/services/tool-service';

interface CompareMatrixProps {
  initialTools: ToolDetail[];
}

export function CompareMatrix({ initialTools }: CompareMatrixProps) {
  const [selectedTools, setSelectedTools] = useState<ToolDetail[]>(initialTools);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allAvailableTools = getAllTools();
  const primaryTool = selectedTools[0] || allAvailableTools[0];
  const presets = getComparePresetsForTool(primaryTool);

  const handleAddTool = (tool: ToolDetail) => {
    if (selectedTools.length < 4 && !selectedTools.some(t => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool]);
    }
    setIsDropdownOpen(false);
  };

  const handleRemoveTool = (toolId: string) => {
    if (selectedTools.length > 1) {
      setSelectedTools(selectedTools.filter(t => t.id !== toolId));
    }
  };

  const getAvgLatency = (tool: ToolDetail) => {
    if (!tool.endpoints.length) return 'N/A';
    const sum = tool.endpoints.reduce((acc, ep) => acc + ep.avgLatencyMs, 0);
    return `${(sum / tool.endpoints.length).toFixed(0)} ms`;
  };

  const getAvgThroughput = (tool: ToolDetail) => {
    if (!tool.endpoints.length) return 'N/A';
    const sum = tool.endpoints.reduce((acc, ep) => acc + ep.throughputRps, 0);
    return `${(sum / tool.endpoints.length).toFixed(0)} rps`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Link className="hover:text-zinc-200" to="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-zinc-200" to="/providers">Compare</Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{primaryTool.name}</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
          {primaryTool.name} compared to other AI Agent Tools
        </h1>
        <p className="text-sm text-zinc-400 max-w-3xl">
          Compare {primaryTool.name} with alternative tools on key metrics including cost per 1k calls, average round-trip latency, concurrency limits, and backed edge providers.
        </p>
      </div>

      {/* Preset Category Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              const matched = preset.toolSlugs
                .map(slug => allAvailableTools.find(t => t.slug === slug))
                .filter((t): t is ToolDetail => Boolean(t));
              if (matched.length) setSelectedTools(matched);
            }}
            className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-zinc-200 group-hover:text-lime-400 transition-colors">
              {preset.title}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Active Tool Slots Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80">
        {selectedTools.map((tool) => (
          <div 
            key={tool.id}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between gap-3 relative group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-lime-400 uppercase tracking-wider font-bold">
                  {tool.category}
                </div>
                <h3 className="text-base font-bold text-zinc-100 mt-0.5">{tool.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">{tool.providerName}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Link className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded" to={`/tools/${tool.slug}`} title="Open Tool Details">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                {selectedTools.length > 1 && (
                  <button
                    onClick={() => handleRemoveTool(tool.id)}
                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded cursor-pointer"
                    title="Remove Tool"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Tool Slot Selector */}
        {selectedTools.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-full min-h-[100px] rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Select a tool</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 space-y-1 max-h-60 overflow-y-auto">
                {allAvailableTools
                  .filter(t => !selectedTools.some(st => st.id === t.id))
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleAddTool(tool)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-zinc-200">{tool.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{tool.slug}</div>
                      </div>
                      <span className="text-[10px] font-mono text-lime-400 font-bold">{tool.pricingSummary}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side-by-Side Specs Matrix Table */}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900/40 overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {/* Category Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400 w-48">Category</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 text-zinc-200 font-bold">{t.category}</td>
              ))}
            </tr>

            {/* Pricing Summary Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Pricing / 1k Calls</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 font-bold text-lime-400">{t.pricingSummary}</td>
              ))}
            </tr>

            {/* Round-Trip Latency Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Avg Round-Trip Latency</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 text-zinc-200">{getAvgLatency(t)}</td>
              ))}
            </tr>

            {/* Throughput RPS Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Throughput</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 text-zinc-200">{getAvgThroughput(t)}</td>
              ))}
            </tr>

            {/* Max Concurrency Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Concurrency Limit</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 text-zinc-200">{t.maxConcurrency}</td>
              ))}
            </tr>

            {/* Inputs Modalities Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Input Modalities</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.modalities.inputs.map((inp, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {inp}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Output Modalities Row */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Output Modalities</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.modalities.outputs.map((out, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20 text-[10px]">
                        {out}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Active Provider Endpoints Count */}
            <tr className="hover:bg-zinc-800/20">
              <td className="px-4 py-3 font-sans font-semibold text-zinc-400">Verified Backends</td>
              {selectedTools.map(t => (
                <td key={t.id} className="px-4 py-3 text-zinc-200">
                  {t.endpoints.length} Active Endpoints
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
