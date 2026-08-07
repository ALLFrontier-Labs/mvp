import React from 'react';
import { Sparkles, Check, Globe } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 font-sans selection:bg-lime-400 selection:text-zinc-950 min-h-screen">
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Free &amp; Open Source</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          No Paywalls. No Limits.
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          LiteDaemon is built for developers. We believe in providing an industry-grade AI tool gateway without restrictive subscriptions, micro-transactions, or hidden fees.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-mono text-zinc-700 dark:text-zinc-300 pt-6">
          <span className="flex items-center gap-2"><Check className="w-5 h-5 text-lime-500" /> Bring Your Own Keys</span>
          <span className="flex items-center gap-2"><Check className="w-5 h-5 text-lime-500" /> Unlimited Routing</span>
          <span className="flex items-center gap-2"><Check className="w-5 h-5 text-lime-500" /> Enterprise Security</span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ready to build?</h2>
            <p className="text-zinc-500">Sign up and start routing your AI requests in seconds.</p>
          </div>
          <div className="flex justify-center">
            <a href="/auth" className="px-8 py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold text-sm transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Launch App
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
