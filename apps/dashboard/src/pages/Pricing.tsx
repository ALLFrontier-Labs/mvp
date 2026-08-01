import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, ChevronDown, Sparkles, Shield, Zap, Key, Activity,
  HelpCircle, CreditCard, ArrowRight, CheckCircle2, Lock
} from 'lucide-react';
import { PricingCalculator } from '../components/PricingCalculator';
import { PricingFeatureMatrix } from '../components/PricingFeatureMatrix';
import { PricingFAQ } from '../components/PricingFAQ';
import { EnterpriseQuoteModal } from '../components/EnterpriseQuoteModal';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: { category: string; items: FAQItem[] }[] = [
  {
    category: 'BYOK Architecture & Billing',
    items: [
      {
        q: 'How does the BYOK (Bring Your Own Key) model work?',
        a: 'LiteDaemon is a 100% BYOK tool engine gateway. You add your direct API keys for Tavily, E2B, Firecrawl, Exa, Steel, or any of our 36+ supported tools into your encrypted vault. Requests route through your direct keys with 0% margin markup.',
      },
      {
        q: 'What is the 5% micro-routing fee?',
        a: 'Instead of charging 40-70% markups like traditional API re-sellers, LiteDaemon charges a flat 5% micro-routing fee to cover global edge proxies, instant failover monitoring, and telemetry logging.',
      },
      {
        q: 'Are failed or fallback attempts billed?',
        a: 'Never. If an upstream provider returns a 429 rate limit or 500 error, LiteDaemon automatically retries with your backup key in <10ms. You are only billed for successful executions.',
      },
    ],
  },
  {
    category: 'Security & Reliability',
    items: [
      {
        q: 'How are my provider API keys protected?',
        a: 'Master API Keys are SHA-256 hashed for instant gateway validation. Downstream provider keys are encrypted at rest using AES-256-GCM and decrypted strictly in RAM for the duration of the HTTP request.',
      },
      {
        q: 'What happens if a provider experiences an outage?',
        a: 'Our intelligent router detects upstream errors in milliseconds and seamlessly rotates to your backup BYOK key or secondary fallback provider adapter within the same HTTP request lifecycle.',
      },
    ],
  },
];

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual]                 = useState(true);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('0-0');

  const toggleFaq = (key: string) => {
    setOpenFaqIndex((prev) => (prev === key ? null : key));
  };

  const proPrice = isAnnual ? 23 : 29;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 font-sans selection:bg-lime-400 selection:text-zinc-950">
      
      {/* ── 1. HERO HEADER & BILLING SWITCHER ───────────────────────────────── */}
      <section className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BYOK Gateway Pricing Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Transparent, Predictable BYOK Gateway Pricing
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Route Tavily, Firecrawl, E2B, Exa, and 30+ providers through your own keys. No hidden markups—just zero-overhead failover and unified execution.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-2">
          <span>✓ Pay only for what you use</span>
          <span>•</span>
          <span>✓ 100 Free requests/mo</span>
          <span>•</span>
          <span>✓ Cancel anytime</span>
        </div>

        {/* Interactive Monthly / Annual Billing Switcher */}
        <div className="flex items-center justify-center gap-3 pt-6 font-mono text-xs">
          <span className={`font-bold transition-colors ${!isAnnual ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
            Monthly Billing
          </span>

          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${isAnnual ? 'bg-lime-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-zinc-950 transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`font-bold transition-colors ${isAnnual ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] animate-pulse">
              Save 20%
            </span>
          </div>
        </div>

      </section>

      {/* ── 2. ENTERPRISE TIER CARDS ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
        
        {/* Card 1: Developer Free */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Developer Free
            </span>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">$0</div>
              <span className="text-xs text-zinc-500">Free forever • No credit card required</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              For side projects, testing, and solo developers evaluating LiteDaemon unified endpoints.
            </p>

            <div className="space-y-3 pt-4 font-mono text-xs border-t border-zinc-200 dark:border-zinc-800">
              {[
                '100 Free Gateway Routing Requests / month',
                '1 Active BYOK Key per provider',
                'Access to all 5 unified endpoints (/v1/search, /v1/scrape, etc.)',
                'Standard SHA-256 Auth & AES-256 Vault',
                'Community Discord Support',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/auth"
            className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs text-center transition-all block cursor-pointer"
          >
            Get Started Free
          </Link>
        </div>

        {/* Card 2: Pro Gateway (Highlighted / Most Popular) */}
        <div className="relative bg-white dark:bg-zinc-900/90 border-2 border-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.15)] rounded-3xl p-8 space-y-6 flex flex-col justify-between transform lg:-translate-y-2 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime-400 text-zinc-950 font-mono font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
            MOST POPULAR • 5% MICRO-ROUTING FEE
          </div>

          <div className="space-y-4 pt-2">
            <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider block">
              Pro Gateway
            </span>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                ${proPrice} <span className="text-xs text-zinc-400 font-normal">/ month</span>
              </div>
              <span className="text-xs text-zinc-500 block">
                {isAnnual ? 'Billed annually ($276/yr)' : 'Billed monthly'}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              For active AI agent developers and production applications needing high availability and auto-failover.
            </p>

            <div className="space-y-3 pt-4 font-mono text-xs border-t border-zinc-200 dark:border-zinc-800">
              {[
                'Includes $20 Prepaid Gateway Balance / month',
                'Unlimited BYOK Vault Keys & Unlimited Providers',
                'Automatic Primary ➔ Secondary Key Failover Routing',
                'Real-time Telemetry, Request Logs & Latency Analytics',
                'Playground Workbench & Custom Header Overrides',
                '99.9% Gateway Uptime SLA',
                'Priority Email & Discord Support',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-zinc-900 dark:text-zinc-100 font-bold">
                  <Check className="w-4 h-4 text-lime-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/auth"
            className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold text-xs text-center transition-all shadow-lg shadow-lime-400/20 block cursor-pointer"
          >
            Start 14-Day Pro Trial
          </Link>
        </div>

        {/* Card 3: Dedicated Enterprise */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Dedicated Enterprise
            </span>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">$499+</div>
              <span className="text-xs text-zinc-500">Custom volume billing • Dedicated infrastructure</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              For high-volume AI agents, production pipelines, and enterprise teams requiring custom SLAs and HSM key security.
            </p>

            <div className="space-y-3 pt-4 font-mono text-xs border-t border-zinc-200 dark:border-zinc-800">
              {[
                'Dedicated Single-Tenant Proxy Edge Routers',
                'Custom SLAs (99.99% Uptime Guarantee)',
                'Custom Adapter Development for Proprietary APIs',
                'IP Whitelisting & Hardware-Backed Key Storage (HSM)',
                'SSO / SAML Authentication & Team RBAC',
                'Dedicated Solutions Architect & 24/7 Slack Channel',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEnterpriseModalOpen(true)}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-bold text-xs text-center transition-all hover:opacity-90 block cursor-pointer"
          >
            Contact Enterprise Sales
          </button>
        </div>

      </section>

      {/* ── 3. INTERACTIVE BYOK COST SAVINGS ESTIMATOR ──────────────────────── */}
      <section className="pt-4">
        <PricingCalculator />
      </section>

      {/* ── 4. DETAILED FEATURE COMPARISON MATRIX ───────────────────────────── */}
      <section className="pt-4">
        <PricingFeatureMatrix />
      </section>

      {/* ── 5. INTERACTIVE FAQ ACCORDION ────────────────────────────────────── */}
      <section className="pt-4">
        <PricingFAQ />
      </section>

      {/* ── 6. ENTERPRISE CUSTOM QUOTE MODAL ────────────────────────────────── */}
      <EnterpriseQuoteModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />

    </div>
  );
};
