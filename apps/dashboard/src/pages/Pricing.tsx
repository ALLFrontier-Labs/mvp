import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, ChevronDown, Sparkles
} from 'lucide-react';
import { getStoredApiKey } from '../lib/api';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: { category: string; items: FAQItem[] }[] = [
  {
    category: 'Billing and Pricing',
    items: [
      {
        q: 'How does the BYOK (Bring Your Own Key) model work?',
        a: 'LiteDaemon is a 100% BYOK tool engine gateway. You add your own API keys for Tavily, E2B, Firecrawl, Exa, Browserbase, or any of our 36+ supported tools into your encrypted vault. All tool calls route through your keys with 0% gateway fee markup.',
      },
      {
        q: 'Can I access all 36+ tool engines on the Free Tier?',
        a: 'Yes! Every developer gets full access to all 36+ search, scraping, browser, code sandbox, document parsing, and embedding engines from day one by bringing their own provider API key.',
      },
      {
        q: 'Do you mark up provider execution costs?',
        a: 'No! When routing requests via your connected BYOK keys, LiteDaemon passes through native provider rates with zero fee markup up to $25,000/mo list price execution.',
      },
      {
        q: 'Are failed or fallback attempts billed?',
        a: 'Never. If an upstream provider returns a 429 rate limit or 500 error, LiteDaemon automatically retries with your next healthy key in <10ms. You are only billed for successful execution responses.',
      },
    ],
  },
  {
    category: 'Tools and Gateway Features',
    items: [
      {
        q: 'How do I integrate LiteDaemon into LangChain, CrewAI, or AutoGen?',
        a: 'Simply point your tool base URL to https://gateway.litedaemon.com/v1 and supply your LiteDaemon master key. Zero framework code rewrites required.',
      },
      {
        q: 'Do you store or log tool payload data?',
        a: 'No. LiteDaemon enforces an ephemeral, memory-only routing policy. Prompts, search queries, code sandbox scripts, and extracted DOM contents are processed strictly in RAM and never stored on disk or used for model training.',
      },
      {
        q: 'Can I set spend caps and rate limits?',
        a: 'Yes. You can configure global monthly spend limits, per-key rate limits, and automated fallback priorities inside your LiteDaemon dashboard.',
      },
    ],
  },
  {
    category: 'Reliability and Uptime',
    items: [
      {
        q: 'What happens if a provider experiences an outage or rate limit?',
        a: 'Our intelligent router detects upstream errors in milliseconds and seamlessly rotates to your backup BYOK key or fallback provider adapter within the same HTTP request lifecycle.',
      },
      {
        q: 'Where can I check live uptime and provider benchmarks?',
        a: 'You can check real-time p50/p90/p99 latency percentiles, uptime percentages, and failover status across all 36+ engines on our Rankings leaderboard.',
      },
    ],
  },
];

export const Pricing: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('0-0');
  const apiKey = getStoredApiKey();
  const ctaRoute = apiKey ? '/keys' : '/auth';

  const toggleFaq = (key: string) => {
    setOpenFaqIndex((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      
      {/* ── 1. HERO SECTION ────────────────────────────────────────────────── */}
      <section className="pt-20 pb-12 px-6 max-w-5xl mx-auto text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-center" style={{ color: 'var(--text-primary)' }}>
          Pricing
        </h1>
        <p className="text-sm sm:text-base max-w-xl mx-auto font-sans" style={{ color: 'var(--text-secondary)' }}>
          Plans for indie hackers, AI native startups, and enterprise agent infrastructure
        </p>

        <div className="flex items-center justify-center gap-4 pt-4 text-sm font-sans">
          <Link
            to={ctaRoute}
            className="font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-sm min-w-[150px] text-center"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
          >
            Get Started
          </Link>
          <a
            href="mailto:sales@litedaemon.com"
            className="border px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 min-w-[150px] text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Talk To Sales
          </a>
        </div>
      </section>

      {/* ── 2. FEATURE COMPARISON MATRIX TABLE ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div 
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              
              {/* Header Row */}
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="p-5 w-1/4" />
                  <th className="p-5 text-center text-sm font-bold w-1/4" style={{ color: 'var(--text-primary)' }}>
                    Free
                  </th>
                  <th 
                    className="p-5 text-center text-sm font-bold w-1/4 border-x relative"
                    style={{ 
                      backgroundColor: 'rgba(204, 255, 0, 0.04)', 
                      borderColor: 'rgba(204, 255, 0, 0.2)',
                      color: 'var(--text-primary)' 
                    }}
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-1" style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}>
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                    <div>Pay-as-you-go</div>
                  </th>
                  <th className="p-5 text-center text-sm font-bold w-1/4" style={{ color: 'var(--text-primary)' }}>
                    Enterprise
                  </th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>

                {/* Platform Fees */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Platform Fees</td>
                  <td className="p-5 text-center font-bold text-emerald-400">0% BYOK Gateway Fee</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--accent)' }}>
                    0% BYOK Markup
                  </td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                    <span className="underline cursor-pointer hover:opacity-80">Fee discounts available</span>
                  </td>
                </tr>

                {/* Tool Engines */}
                <tr>
                  <td className="p-5 space-y-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tool Engines</div>
                    <Link to="/providers" className="text-[11px] hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Explore 36+ engines &rarr;
                    </Link>
                  </td>
                  <td className="p-5 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>36+ engines (BYOK)</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>
                    36+ engines (BYOK)
                  </td>
                  <td className="p-5 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                    36+ engines (Dedicated Pools)
                  </td>
                </tr>

                {/* Providers */}
                <tr>
                  <td className="p-5 space-y-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tool Providers</div>
                    <Link to="/providers" className="text-[11px] hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Explore providers &rarr;
                    </Link>
                  </td>
                  <td className="p-5 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>36+ connected providers</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>
                    36+ connected providers
                  </td>
                  <td className="p-5 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                    36+ connected providers
                  </td>
                </tr>

                {/* API Access */}
                <tr>
                  <td className="p-5 space-y-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>API & Playground Access</div>
                    <Link to="/playground" className="text-[11px] hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Try playground &rarr;
                    </Link>
                  </td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                </tr>

                {/* Activity Logs */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Activity Logs & Export</td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                </tr>

                {/* Auto-routing & Failover */}
                <tr>
                  <td className="p-5 space-y-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Auto-routing & Multi-Key Failover</div>
                    <Link to="/docs/failover" className="text-[11px] hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Learn more &rarr;
                    </Link>
                  </td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-muted)' }}>Single Key / Provider</td>
                  <td className="p-5 text-center font-semibold text-emerald-400" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}>
                    Multi-Key Rotation Pool
                  </td>
                  <td className="p-5 text-center font-semibold text-emerald-400">
                    Multi-Key Rotation Pool + Priority
                  </td>
                </tr>

                {/* Budgets & Spend Controls */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Budgets & Spend Controls</td>
                  <td className="p-5 text-center"><X className="w-4 h-4 mx-auto text-zinc-600" /></td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                </tr>

                {/* Contractual SLAs */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Contractual SLAs</td>
                  <td className="p-5 text-center"><X className="w-4 h-4 mx-auto text-zinc-600" /></td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}><X className="w-4 h-4 mx-auto text-zinc-600" /></td>
                  <td className="p-5 text-center"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                </tr>

                {/* Payment Options */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Options</td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-muted)' }}>N/A (Free BYOK)</td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>Credit card, crypto & more</td>
                  <td className="p-5 text-center font-medium" style={{ color: 'var(--text-primary)' }}>Invoicing options</td>
                </tr>

                {/* BYOK Limits */}
                <tr>
                  <td className="p-5 space-y-1">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>BYOK Limits</div>
                    <Link to="/docs/keys" className="text-[11px] hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      Learn more &rarr;
                    </Link>
                  </td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>1,000 calls / month free</td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>
                    $25,000 list price inference / month with no fees
                  </td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-primary)' }}>
                    $200,000+ list price inference / month with no fees
                  </td>
                </tr>

                {/* Rate Limits */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Rate Limits</td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>100 reqs/min</td>
                  <td className="p-5 text-center font-medium" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>10,000 reqs/min</td>
                  <td className="p-5 text-center font-medium" style={{ color: 'var(--text-primary)' }}>Optional dedicated limits</td>
                </tr>

                {/* Support */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Support</td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>Community Support</td>
                  <td className="p-5 text-center font-medium" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>Email Support</td>
                  <td className="p-5 text-center font-medium" style={{ color: 'var(--text-primary)' }}>Support SLA with Shared Slack Channel</td>
                </tr>

                {/* Table Footer Buttons */}
                <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-5" />
                  <td className="p-5 text-center">
                    <Link
                      to={ctaRoute}
                      className="inline-block px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      Get Started For Free
                    </Link>
                  </td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}>
                    <Link
                      to={ctaRoute}
                      className="inline-block px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
                    >
                      Connect BYOK Keys
                    </Link>
                  </td>
                  <td className="p-5 text-center">
                    <a
                      href="mailto:sales@litedaemon.com"
                      className="inline-block px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      Contact Sales
                    </a>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 3. FREQUENTLY ASKED QUESTIONS ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-sans" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Everything you need to know about LiteDaemon billing, BYOK failover, and rate limits.
          </p>
        </div>

        <div className="space-y-8">
          {FAQS.map((categoryGroup, catIdx) => (
            <div key={categoryGroup.category} className="space-y-3">
              <h3 className="text-base font-bold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {categoryGroup.category}
              </h3>

              <div className="space-y-2">
                {categoryGroup.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openFaqIndex === key;

                  return (
                    <div
                      key={item.q}
                      className="border rounded-2xl overflow-hidden transition-colors"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                      <button
                        onClick={() => toggleFaq(key)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} style={{ color: 'var(--text-muted)' }} />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs leading-relaxed border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. READY TO GET STARTED BANNER ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div 
          className="p-10 rounded-3xl border text-center space-y-6 shadow-2xl relative overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'rgba(204, 255, 0, 0.3)',
            boxShadow: '0 0 40px rgba(204, 255, 0, 0.05)'
          }}
        >
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
              Ready To Get Started?
            </h3>
            <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of developers building high-availability autonomous agents with LiteDaemon.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={ctaRoute}
              className="font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-md min-w-[160px]"
              style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
            >
              Sign Up For Free
            </Link>
            <a
              href="mailto:sales@litedaemon.com"
              className="border px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 min-w-[160px]"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
