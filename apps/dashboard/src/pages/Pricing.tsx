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
          100 free tool calls per month. 5% markup per call post 100 calls, or 0% gateway fee with BYOK.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4 text-sm font-sans">
          <Link
            to="/auth"
            className="font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-sm min-w-[150px] text-center"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
          >
            Get Started
          </Link>
          <Link
            to="/contact-sales"
            className="border px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 min-w-[150px] text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Talk To Sales
          </Link>
        </div>
      </section>

      {/* ── 1.5 PRICING CARDS ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Free Tier */}
          <div
            className="rounded-3xl p-8 border space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Resets every 30 days
                </span>
                <span className="text-xs font-mono text-zinc-500">Tier 1</span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">Free Monthly Allowance</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                  100 free API calls every month across all integrated tools (Tavily, Exa, E2B, Firecrawl, etc.).
                </p>
              </div>

              <div className="py-2">
                <span className="text-4xl font-extrabold font-mono text-white">$0</span>
                <span className="text-xs font-mono text-zinc-400"> / month</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300 font-sans pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100 free API calls per billing month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full access to all 36+ integrated tool engines</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ephemeral in-memory key vault &amp; zero disk logging</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic monthly resets back to 0</span>
                </li>
              </ul>
            </div>

            <Link
              to="/auth"
              className="w-full py-3.5 rounded-2xl text-center text-xs font-extrabold border transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Get Started For Free
            </Link>
          </div>

          {/* Card 2: Pay-As-You-Go */}
          <div
            className="rounded-3xl p-8 border space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'rgba(163, 230, 53, 0.4)',
              boxShadow: '0 0 30px rgba(163, 230, 53, 0.08)' 
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Post 100 Calls
                </span>
                <span className="text-xs font-mono text-lime-400 font-semibold">Standard Plan</span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">Pay-As-You-Go (BYOK / Pass-Through)</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                  For usage beyond 100 calls.
                </p>
              </div>

              <div className="py-2 space-y-1">
                <div className="text-2xl font-extrabold font-mono text-lime-400">
                  Raw Provider Cost + 5% Markup
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-lime-400/10 border border-lime-400/30 text-[11px] font-mono text-lime-300">
                  <code>Final Cost = Raw Provider Cost × 1.05</code>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300 font-sans pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Direct provider key pass-through (Tavily, E2B, Exa, etc.)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Exact transparent calculation: <code>Final Cost = Raw Provider Cost × 1.05</code></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Automatic monthly resets back to free tier</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Multi-key priority &amp; automated fallback failover</span>
                </li>
              </ul>
            </div>

            <Link
              to="/auth"
              className="w-full py-3.5 rounded-2xl text-center text-xs font-extrabold shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
            >
              Start Routing API Calls →
            </Link>
          </div>

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
                    Free Tier
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
                      <Sparkles className="w-3 h-3" /> Pay-as-you-go
                    </div>
                    <div>Standard Engine</div>
                  </th>
                  <th className="p-5 text-center text-sm font-bold w-1/4" style={{ color: 'var(--text-primary)' }}>
                    Enterprise
                  </th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>

                {/* Monthly Free Calls */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Free Allowance</td>
                  <td className="p-5 text-center font-bold text-emerald-400">100 free calls / mo (resets every 30 days)</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--text-primary)' }}>
                    100 free calls / mo
                  </td>
                  <td className="p-5 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                    Custom monthly quota
                  </td>
                </tr>

                {/* Per Call Fee & Markup */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>Execution Markup (Post 100 calls)</td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-muted)' }}>0% (up to 100 calls)</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--accent)' }}>
                    5% markup per call
                  </td>
                  <td className="p-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                    <span className="underline cursor-pointer hover:opacity-80">Volume fee discounts</span>
                  </td>
                </tr>

                {/* BYOK Key Markup */}
                <tr>
                  <td className="p-5 font-semibold" style={{ color: 'var(--text-primary)' }}>BYOK Connected Key Fee</td>
                  <td className="p-5 text-center font-bold text-emerald-400">0% (up to 100 calls/mo)</td>
                  <td className="p-5 text-center font-bold" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)', color: 'var(--accent)' }}>
                    5% routing fee per call (post 100 calls)
                  </td>
                  <td className="p-5 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                    Volume Fee Discounts
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

                {/* Tool Providers */}
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
                      to="/auth"
                      className="inline-block px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      Get Started For Free
                    </Link>
                  </td>
                  <td className="p-5 text-center" style={{ backgroundColor: 'rgba(204, 255, 0, 0.04)' }}>
                    <Link
                      to="/auth"
                      className="inline-block px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
                    >
                      Sign Up For Free
                    </Link>
                  </td>
                  <td className="p-5 text-center">
                    <Link
                      to="/contact-sales"
                      className="inline-block px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      Contact Sales
                    </Link>
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
              to="/auth"
              className="font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-md min-w-[160px]"
              style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
            >
              Sign Up For Free
            </Link>
            <Link
              to="/contact-sales"
              className="border px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 min-w-[160px]"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
