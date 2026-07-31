import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, CheckCircle2, ArrowLeft } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            Security &amp; Data Privacy Policy
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
            Last Updated: July 31, 2026 • Ephemeral Zero-Storage BYOK Gateway
          </p>
        </div>

        {/* Privacy Content Modules */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          {/* Module 1: Zero Payload Retention */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
              <EyeOff className="w-6 h-6" />
              <h2>1. Zero Payload Retention Guarantee</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              LiteDaemon is engineered as a strict pass-through proxy. Prompt contents, web scraping output bodies, browser CDP execution steps, document contents, and search query parameters stream strictly through isolated in-memory channels.
            </p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400">
              ✓ Payloads are processed 100% in-memory.<br />
              ✓ Web scrape outputs, prompt text, and search bodies are NEVER written to disk.<br />
              ✓ We NEVER sell, share, or log your application data.
            </div>
          </section>

          {/* Module 2: API Key Security */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-teal-400 font-bold text-lg">
              <Lock className="w-6 h-6" />
              <h2>2. Provider API Key Encryption (AES-256-GCM)</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Bring Your Own Key (BYOK) provider credentials added to your dashboard vault (Tavily, Firecrawl, Browserbase, E2B, Serper) are encrypted at rest using AES-256-GCM. Plaintext keys are decrypted only inside isolated runtime memory during active proxy requests.
            </p>
          </section>

          {/* Module 3: Non-Sensitive Telemetry Collection */}
          <section className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg">
              <Server className="w-6 h-6" />
              <h2>3. Telemetry Collection &amp; Usage</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              To provide usage accounting and multi-key failover stats, LiteDaemon records non-sensitive operational telemetry:
            </p>
            <ul className="space-y-2 text-xs font-mono text-zinc-400 list-disc pl-5">
              <li>Request counts and timestamps</li>
              <li>HTTP status codes (e.g., 200, 429, 502)</li>
              <li>Execution duration (milliseconds) and provider routing choice</li>
              <li>Ledger billing transactions for 5% BYOK micro-fees</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-400 flex items-center justify-between">
            <span>Questions regarding data privacy?</span>
            <a href="mailto:security@litedaemon.com" className="text-emerald-400 font-bold hover:underline">
              security@litedaemon.com →
            </a>
          </section>

        </div>

      </div>
    </div>
  );
};
