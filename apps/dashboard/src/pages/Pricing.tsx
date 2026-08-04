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
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('0-0');

  const toggleFaq = (key: string) => {
    setOpenFaqIndex((prev) => (prev === key ? null : key));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 font-sans selection:bg-lime-400 selection:text-zinc-950">
      
      {/* ── 1. HERO HEADER ───────────────────────────────── */}
      <section className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pay-As-You-Go BYOK Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Transparent, Predictable API Routing
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Route Tavily, Firecrawl, E2B, Exa, and 30+ providers through your own keys. Zero subscriptions. Never expires.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-2">
          <span>✓ Pay only for what you use</span>
          <span>•</span>
          <span>✓ 100 Free requests/mo</span>
          <span>•</span>
          <span>✓ Prepaid credits never expire</span>
        </div>
      </section>

      {/* ── 2. PRICING TIERS ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4 max-w-5xl mx-auto">
        
        {/* Card 1: Developer Free */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Developer Free
            </span>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">100 Calls</div>
              <span className="text-xs text-zinc-500">Free every month • Resets automatically</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              Perfect for side projects, testing, and solo developers evaluating LiteDaemon's unified endpoints.
            </p>

            <div className="space-y-3 pt-4 font-mono text-xs border-t border-zinc-200 dark:border-zinc-800">
              {[
                '100 Free Gateway Routing Requests / month',
                'Unlimited BYOK Key Storage',
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
            className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs text-center transition-all block cursor-pointer mt-8"
          >
            Get Started Free
          </Link>
        </div>

        {/* Card 2: Pay-As-You-Go (Highlighted) */}
        <div className="relative bg-white dark:bg-zinc-900/90 border-2 border-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.15)] rounded-3xl p-8 space-y-6 flex flex-col justify-between transform lg:-translate-y-2 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime-400 text-zinc-950 font-mono font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
            OPENROUTER STYLE • CUSTOM TOP-UP
          </div>

          <div className="space-y-4 pt-2">
            <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider block">
              Pay-As-You-Go Gateway
            </span>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                +5% <span className="text-xs text-zinc-400 font-normal">micro-routing fee</span>
              </div>
              <span className="text-xs text-zinc-500 block">
                Top-up your wallet with a custom amount ($5 minimum) via Dodo Payments.
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              After your 100 free calls, executions securely deduct from your lifetime prepaid balance. Credits never expire.
            </p>

            <div className="space-y-3 pt-4 font-mono text-xs border-t border-zinc-200 dark:border-zinc-800">
              {[
                'Strict Provider Cost + 5% Margin Deduction',
                'Zero Monthly Subscription Fees',
                'Prepaid Wallet Credits Never Expire',
                'Automatic Primary ➔ Secondary Key Failover',
                'Real-time Telemetry, Request Logs & Latency Analytics',
                '99.9% Gateway Uptime SLA',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-zinc-900 dark:text-zinc-100 font-bold">
                  <Check className="w-4 h-4 text-lime-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/billing"
            className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold text-xs text-center transition-all shadow-lg shadow-lime-400/20 block cursor-pointer mt-8"
          >
            Deposit Custom Amount
          </Link>
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
