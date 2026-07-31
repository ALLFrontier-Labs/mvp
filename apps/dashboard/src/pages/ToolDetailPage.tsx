import React from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { ToolDetailLayout } from '../components/tools/ToolDetailLayout';
import { ToolHeroHeader } from '../components/tools/ToolHeroHeader';
import { getToolBySlug } from '../lib/services/tool-service';
import { ShieldCheck, Zap, Server, DollarSign, Activity, BarChart3, AppWindow, LineChart, HelpCircle, ArrowLeft } from 'lucide-react';

export const ToolDetailPage: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // Handle both /tools/:provider/:tool and wildcard /tools/*
  let slug = params.slug || '';
  if (!slug) {
    slug = location.pathname.replace(/^\/tools\//, '');
  }

  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans px-6 py-20 text-center space-y-4">
        <div className="text-4xl font-extrabold text-white">Tool Not Found</div>
        <p className="text-zinc-400 text-sm max-w-md mx-auto font-mono">
          No tool engine found matching slug <code className="text-yellow-400 font-mono">{slug}</code>.
        </p>
        <div>
          <Link to="/providers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tool Providers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* Main Relational Tool Layout */}
      <ToolDetailLayout>
        
        {/* Dynamic Tool Hero Header */}
        <ToolHeroHeader
          tool={tool}
          onOpenPlayground={() => navigate('/playground')}
          onOpenQuickStart={() => navigate('/docs/quickstart')}
          onCompare={() => navigate('/providers')}
        />

        {/* Section 1: Providers & Backends */}
        <section id="providers" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2>Providers &amp; Backends</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Active verified backend endpoints available for BYOK routing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {tool.endpoints.map((ep) => (
              <div key={ep.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{ep.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    {ep.region}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Latency: <strong className="text-white">{ep.avgLatencyMs}ms</strong></span>
                  <span>Uptime: <strong className="text-emerald-400">{ep.uptimePercentage}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Effective Pricing */}
        <section id="pricing" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <h2>Effective Pricing &amp; Micro-Fees</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Base provider cost is billed directly to your provider account. LiteDaemon micro-debits a 5% list-price fee past 1,000 free monthly calls.
          </p>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 flex justify-between items-center">
            <span>List Price Base Fee:</span>
            <span className="text-yellow-400 font-bold">{tool.pricingSummary}</span>
          </div>
        </section>

        {/* Section 3: Performance */}
        <section id="performance" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Zap className="w-5 h-5 text-teal-400" />
            <h2>Performance &amp; Concurrency</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Max Concurrency: <strong className="text-white font-mono">{tool.maxConcurrency}</strong>.
          </p>
        </section>

        {/* Section 4: Uptime & Health */}
        <section id="uptime" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2>Uptime &amp; Health Checks</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Automated health probes execute every 30 seconds across multi-region endpoints.
          </p>
        </section>

        {/* Section 5: Benchmarks */}
        <section id="benchmarks" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2>Benchmarks</h2>
          </div>
          <div className="space-y-3 font-mono text-xs">
            {tool.benchmarks.map((bm, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex justify-between text-white font-bold">
                  <span>{bm.metricName}</span>
                  <span className="text-purple-400">{bm.score} / {bm.maxScore}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">{bm.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Top Apps */}
        <section id="apps" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <AppWindow className="w-5 h-5 text-indigo-400" />
            <h2>Top Apps &amp; Frameworks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {tool.topApps.map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-bold text-white block font-sans">{app.name}</span>
                <span className="text-zinc-400 text-[11px] font-sans block">{app.description}</span>
                <span className="text-indigo-400 font-bold block pt-1">{app.totalVolumeFormatted}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Activity */}
        <section id="activity" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <LineChart className="w-5 h-5 text-emerald-400" />
            <h2>Call Activity &amp; Volume</h2>
          </div>
          <p className="text-zinc-400 text-xs font-mono">
            Showing last 6 days gateway routing volume:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            {tool.activityHistory.map((act) => (
              <div key={act.date} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 text-[10px] block">{act.date}</span>
                <span className="text-emerald-400 font-bold block">{(act.successfulCalls / 1000000).toFixed(2)}M calls</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: FAQ */}
        <section id="faq" className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4 text-xs font-sans">
            {tool.faqs.map((faq, i) => (
              <div key={i} className="space-y-1">
                <h4 className="font-bold text-white">{faq.question}</h4>
                <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

      </ToolDetailLayout>
    </div>
  );
};
