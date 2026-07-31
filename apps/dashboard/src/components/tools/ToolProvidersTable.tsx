import React from 'react';
import { ShieldCheck, ArrowUpDown } from 'lucide-react';
import { ToolProviderEndpoint } from '../../types/tool-detail';

export function ToolProvidersTable({ endpoints }: { endpoints: ToolProviderEndpoint[] }) {
  return (
    <section id="providers" className="space-y-4 pt-4 font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Providers &amp; Backends</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Different edge endpoints host or proxy this tool. Requests route dynamically based on selected priority.
          </p>
        </div>
      </div>

      <div className="border border-zinc-800/80 rounded-2xl bg-zinc-900/40 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/80 text-zinc-400 font-mono border-b border-zinc-800/80 uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3 font-medium">Provider <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
              <th className="px-4 py-3 font-medium">Input / 1k</th>
              <th className="px-4 py-3 font-medium">Output / 1k</th>
              <th className="px-4 py-3 font-medium">Cache Read / 1k</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">Throughput</th>
              <th className="px-4 py-3 font-medium">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {endpoints.map((ep) => (
              <tr key={ep.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 flex items-center gap-2 font-sans font-medium text-zinc-200">
                  <span>{ep.name}</span>
                  {ep.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />}
                </td>
                <td className="px-4 py-3.5">${ep.costPer1kCalls.toFixed(3)}</td>
                <td className="px-4 py-3.5">${(ep.costPer1kCalls * 1.5).toFixed(3)}</td>
                <td className="px-4 py-3.5 text-zinc-400">${(ep.costPer1kCalls * 0.2).toFixed(3)}</td>
                <td className="px-4 py-3.5">{ep.avgLatencyMs}ms</td>
                <td className="px-4 py-3.5">{ep.throughputRps} rps</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${ep.uptimePercentage > 99 ? 'bg-lime-400' : 'bg-amber-400'}`} 
                        style={{ width: `${ep.uptimePercentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-300">{ep.uptimePercentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
