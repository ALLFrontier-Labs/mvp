import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, CreditCard, Activity, ArrowLeft } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" />
            Terms of Service &amp; Gateway Usage Policy
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
            LiteDaemon BYOK Gateway
          </p>
        </div>

        {/* Terms Content Modules */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Acceptable Use Policy */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-yellow-400 font-bold text-lg">
              <ShieldAlert className="w-6 h-6" />
              <h2>1. Acceptable Use Policy</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              You agree to use LiteDaemon BYOK Gateway proxies exclusively for lawful autonomous agent execution and developer applications. You agree not to route malicious scraping botnets, denial-of-service traffic, or unauthorized credential stuffing attacks.
            </p>
          </section>

          {/* Section 2: BYOK Billing Terms */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
              <CreditCard className="w-6 h-6" />
              <h2>2. BYOK Billing &amp; Wallet Terms</h2>
            </div>
            <div className="space-y-3 text-xs font-mono text-zinc-400">
              <p className="text-zinc-300">
                • <strong>Free Monthly Allowance:</strong> Every LiteDaemon account receives 100 free API calls per billing month across all integrated tools (Tavily, Exa, E2B, Firecrawl, etc.). Free monthly call counters automatically reset to 0 every 30 days from the start of the user's billing period.
              </p>
              <p className="text-zinc-300">
                • <strong>Overage Routing Fee:</strong> Requests exceeding 100 calls per month incur a 5% micro-fee based on standard provider list prices.
              </p>
              <p className="text-zinc-300">
                • <strong>Prepaid Deposits:</strong> Wallet top-ups require a minimum deposit of $5.00 USD processed via Lemon Squeezy. Prepaid balances are non-refundable and do not expire.
              </p>
            </div>
          </section>

          {/* Section 3: Service Availability & SLA */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-teal-400 font-bold text-lg">
              <Activity className="w-6 h-6" />
              <h2>3. Service Availability &amp; Multi-Key Failover</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              LiteDaemon provides automated multi-key failover across your configured provider keys. LiteDaemon is not liable for third-party upstream provider outages (e.g. Tavily, Firecrawl, E2B API downtime) beyond automated fallback key attempts.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-400 flex items-center justify-between">
            <span>Need enterprise custom terms or SLA?</span>
            <a href="mailto:support@litedaemon.com" className="text-yellow-400 font-bold hover:underline">
              support@litedaemon.com →
            </a>
          </section>

        </div>

      </div>
    </div>
  );
};
