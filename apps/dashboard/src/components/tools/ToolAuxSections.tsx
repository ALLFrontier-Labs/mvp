import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AppWindow, HelpCircle, BarChart3 } from 'lucide-react';
import { ToolDetail } from '../../types/tool-detail';

export function ToolAuxSections({ tool }: { tool: ToolDetail }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-12 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Benchmarks Section */}
      <section id="benchmarks" className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <span>Benchmarks &amp; Evaluations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Standardized reliability and tool-calling accuracy metrics compared against peer integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.benchmarks.map((bm, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-3 shadow-xs">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                {bm.score} <span className="text-xs text-slate-500 dark:text-zinc-500 font-normal">/ {bm.maxScore}</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{bm.metricName}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">{bm.description}</div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/60 text-[11px] text-lime-600 dark:text-lime-400 font-mono">
                Better than {bm.percentile}% of tools
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Apps Section */}
      <section id="apps" className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <span>Top Apps &amp; Frameworks</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Public AI agents and execution runtimes sending the highest volume to this tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tool.topApps.map((app, idx) => (
            <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">#{idx + 1}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-200">{app.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">{app.description}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-lime-700 dark:text-lime-400 bg-lime-500/10 px-2 py-1 rounded">
                {app.totalVolumeFormatted}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Section */}
      <section id="activity" className="pt-4 border-t border-slate-200 dark:border-zinc-800/60 space-y-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">📈 Activity &amp; Volume</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Total API request throughput across all active edge keys.</p>
        <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 space-y-3 font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <span>6-Day Real-Time Gateway Routing Volume</span>
            <span className="text-lime-600 dark:text-lime-400 font-bold">100% Operational</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tool.activityHistory.map((act) => (
              <div key={act.date} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 space-y-1">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{act.date}</span>
                <span className="text-lime-600 dark:text-lime-400 font-bold block">{(act.successfulCalls / 1000000).toFixed(2)}M calls</span>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{act.cachedCalls ? `${(act.cachedCalls / 1000).toFixed(0)}k cached` : '0 cached'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="space-y-2">
          {tool.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-900/40 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-zinc-200">{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-200 dark:border-zinc-800/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
