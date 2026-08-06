import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Terminal, 
  GitCompare 
} from 'lucide-react';
import { ToolDetail } from '../../types/tool-detail';

interface ToolHeroHeaderProps {
  tool: ToolDetail;
  onOpenPlayground?: () => void;
  onOpenQuickStart?: () => void;
  onCompare?: () => void;
}

export function ToolHeroHeader({
  tool,
  onOpenPlayground,
  onOpenQuickStart,
  onCompare
}: ToolHeroHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleCopySlug = () => {
    navigator.clipboard.writeText(tool.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="space-y-6 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Top Title & Quick Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-lime-500/20 border border-lime-500/30 text-lime-600 dark:text-lime-400 flex items-center justify-center font-bold text-sm">
              {tool.providerName.charAt(0)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              {tool.providerName}: {tool.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <span>{tool.slug}</span>
            <button
              onClick={handleCopySlug}
              className="p-1 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              title="Copy tool slug"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          <Link
            to={`/compare/${tool.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </Link>
          
          <button
            onClick={onOpenPlayground}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Playground</span>
          </button>

          <button
            onClick={onOpenQuickStart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-lime-500 dark:bg-lime-400 hover:bg-lime-400 dark:hover:bg-lime-300 text-slate-950 dark:text-zinc-950 font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Quick Start</span>
          </button>
        </div>
      </div>

      {/* Dynamic Description with Show More / Show Less */}
      <div className="space-y-2 max-w-4xl">
        <p className={`text-sm text-slate-700 dark:text-zinc-300 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {tool.fullDescription}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs text-lime-600 dark:text-lime-400 hover:text-lime-500 dark:hover:text-lime-300 font-medium transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Show less' : 'Show more'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Summary Spec Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Card 1: Modalities */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-sans">
            Modalities
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-zinc-200">
            <div className="flex items-center gap-1">
              {tool.modalities.inputs.map((inp, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-mono">
                  {inp.charAt(0)}
                </span>
              ))}
            </div>
            <span className="text-slate-400 dark:text-zinc-500">→</span>
            <div className="flex items-center gap-1">
              {tool.modalities.outputs.map((out, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20 text-[10px] font-mono">
                  {out.charAt(0)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Pricing */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-sans">
            In / Out Price
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {tool.pricingSummary}
          </div>
        </div>

        {/* Card 3: Context / Concurrency */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-sans">
            Concurrency Limit
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {tool.maxConcurrency}
          </div>
        </div>

        {/* Card 4: Released */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-sans">
            Released
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {tool.releaseDate}
          </div>
        </div>
      </div>
    </header>
  );
}
