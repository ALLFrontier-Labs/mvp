import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Check, Copy, ChevronRight, Shield,
  DollarSign, Globe, Cpu, Search, Layout, Code2,
  Wallet, Key, X, Layers, Activity
} from 'lucide-react';

// ── Code example snippets ─────────────────────────────────────────────────────
const CODE_EXAMPLES = {
  curl: `# ONE key. ALL providers. No subscriptions.
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/scrape \\
  -H "Authorization: Bearer ld_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"params": {"url": "https://example.com"}}'

# Search (auto-picks Serper / Tavily / Exa)
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/search \\
  -H "Authorization: Bearer ld_your_key" \\
  -d '{"params": {"query": "latest AI news"}}'

# Cloud browser session
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/browser \\
  -H "Authorization: Bearer ld_your_key" \\
  -d '{"provider": "browserbase", "params": {}}'`,

  typescript: `// npm install nothing — just fetch
const BASE = "https://mvp-production-c1e8.up.railway.app";
const KEY  = "ld_your_key";

const headers = {
  "Authorization": \`Bearer \${KEY}\`,
  "Content-Type":  "application/json",
};

// Scrape any URL — LiteDaemon picks cheapest live provider
const { result } = await fetch(\`\${BASE}/v1/scrape\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ params: { url: "https://example.com" } }),
}).then(r => r.json());

// Search
const { result: searchResult } = await fetch(\`\${BASE}/v1/search\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ params: { query: "AI news 2026" } }),
}).then(r => r.json());`,

  python: `import requests

BASE = "https://mvp-production-c1e8.up.railway.app"
KEY  = "ld_your_key"
H    = {"Authorization": f"Bearer {KEY}"}

# Scrape any URL — auto picks cheapest available provider
res = requests.post(f"{BASE}/v1/scrape",
    headers=H, json={"params": {"url": "https://example.com"}})
print(res.json()["result"]["markdown"])

# Search — auto picks Serper, Tavily, or Exa
res = requests.post(f"{BASE}/v1/search",
    headers=H, json={"params": {"query": "AI agents 2026"}})
print(res.json()["result"])`,
};

const PROVIDERS = [
  { name: 'Firecrawl',    cat: 'Scraping',  cost: '$0.003', dot: 'bg-emerald-400', icon: '🔥' },
  { name: 'Jina AI',      cat: 'Scraping',  cost: '$0.001', dot: 'bg-emerald-400', icon: '⚡' },
  { name: 'Spider',       cat: 'Crawling',  cost: '$0.002', dot: 'bg-emerald-400', icon: '🕷️' },
  { name: 'Apify',        cat: 'Crawling',  cost: '$0.005', dot: 'bg-emerald-400', icon: '🤖' },
  { name: 'Tavily',       cat: 'Search',    cost: '$0.001', dot: 'bg-emerald-400', icon: '🔍' },
  { name: 'Exa AI',       cat: 'Search',    cost: '$0.002', dot: 'bg-emerald-400', icon: '🧠' },
  { name: 'Serper',       cat: 'Search',    cost: '$0.001', dot: 'bg-emerald-400', icon: '📊' },
  { name: 'Browserbase',  cat: 'Browser',   cost: '$0.015', dot: 'bg-emerald-400', icon: '🌐' },
  { name: 'Steel',        cat: 'Browser',   cost: '$0.015', dot: 'bg-amber-400',   icon: '🛡️' },
  { name: 'E2B Sandbox',  cat: 'Execute',   cost: '$0.008', dot: 'bg-slate-500',   icon: '💻' },
];

export const Landing: React.FC = () => {
  const [codeTab, setCodeTab] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[codeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 overflow-x-hidden">

      {/* ── Top Navigation ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0a0d14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">LiteDaemon</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v1.0</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/providers" className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block">
              Browse Providers
            </Link>
            <Link to="/auth" className="text-slate-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all"
            >
              Get API Key <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient gradients */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            OpenRouter for AI Agent Infrastructure
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            One Wallet.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Every AI Tool.
            </span>
            <br />Zero Markup.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Stop juggling 4+ provider subscriptions and API keys. Deposit once into LiteDaemon, call one consistent API, and we route to Firecrawl, Tavily, Browserbase, E2B and 6 more — automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25"
            >
              <Key className="w-4 h-4" />
              Get API Key — Free to Start
            </Link>
            <Link
              to="/providers"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              <Layers className="w-4 h-4" />
              Browse 10 Providers
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          {/* Quick trust stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500">
            {[
              { icon: Activity, text: '9 Providers Live' },
              { icon: DollarSign, text: 'From $0.001 / call' },
              { icon: Shield, text: 'Zero Platform Markup' },
              { icon: Wallet, text: 'Pay-as-you-go wallet' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After Comparison ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">The Problem LiteDaemon Solves</h2>
          <p className="text-slate-400">Building AI agents means managing a web of subscriptions and API keys.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <X className="w-5 h-5" />
              <span>The Old Way</span>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { service: 'Firecrawl',   cost: '$16/mo', detail: 'web scraping subscription' },
                { service: 'Tavily',      cost: '$25/mo', detail: 'AI search subscription' },
                { service: 'Browserbase', cost: '$99/mo', detail: 'browser session subscription' },
                { service: 'E2B',         cost: '$25/mo', detail: 'code execution subscription' },
              ].map(s => (
                <li key={s.service} className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/10">
                  <div>
                    <span className="font-semibold text-rose-300">{s.service}</span>
                    <span className="text-slate-500 text-xs ml-2">{s.detail}</span>
                  </div>
                  <span className="text-rose-400 font-mono font-bold text-xs">{s.cost}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-rose-500/10 space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between"><span>Monthly cost</span><span className="text-rose-400 font-bold">$165+/mo</span></div>
              <div className="flex justify-between"><span>API keys to manage</span><span className="text-rose-400 font-bold">4+ keys</span></div>
              <div className="flex justify-between"><span>Credit cards</span><span className="text-rose-400 font-bold">4 bills</span></div>
              <div className="flex justify-between"><span>Wasted unused credits</span><span className="text-rose-400 font-bold">Always</span></div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-5 h-5" />
              <span>With LiteDaemon</span>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { text: '1 LiteDaemon API key',       sub: 'works for all 10 providers' },
                { text: '1 prepaid wallet',            sub: 'deposit any amount from $5' },
                { text: 'Pay per call, not per month', sub: 'only pay for what you use' },
                { text: 'Auto-routing',                sub: 'picks cheapest live provider' },
              ].map(s => (
                <li key={s.text} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/10">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-200">{s.text}</span>
                    <span className="text-slate-500 text-xs block">{s.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-emerald-500/10 space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between"><span>Example: 100 scrapes + 50 searches</span><span className="text-emerald-400 font-bold">~$0.35</span></div>
              <div className="flex justify-between"><span>API keys to manage</span><span className="text-emerald-400 font-bold">1 key</span></div>
              <div className="flex justify-between"><span>Subscriptions</span><span className="text-emerald-400 font-bold">$0</span></div>
              <div className="flex justify-between"><span>Unused credits wasted</span><span className="text-emerald-400 font-bold">Never</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Live in 3 Steps</h2>
          <p className="text-slate-400 font-mono text-sm">No SDK. No SDK. No SDK. Just fetch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: Wallet,
              title: 'Deposit',
              desc: 'Sign up with email. Deposit any amount from $5 into your prepaid wallet. No monthly commitment.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
            {
              step: '02',
              icon: Key,
              title: 'Get Your Key',
              desc: 'Copy your single ld_... API key. Use it to call /v1/scrape, /v1/search, /v1/browser, or /v1/execute.',
              color: 'text-teal-400',
              bg: 'bg-teal-500/10 border-teal-500/20',
            },
            {
              step: '03',
              icon: Zap,
              title: 'We Route & Bill',
              desc: 'LiteDaemon routes to the cheapest live provider. Your wallet is micro-debited only for successful calls.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
            },
          ].map(s => (
            <div key={s.step} className="relative rounded-2xl bg-[#121620] border border-slate-800 p-6 space-y-4">
              <span className="absolute top-4 right-4 font-mono text-xs text-slate-700 font-bold">{s.step}</span>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="font-bold text-white text-lg">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Example ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            One Endpoint Replaces Four SDKs
          </h2>
          <p className="text-slate-400 text-sm">No provider-specific SDKs. Just standard HTTP. Works in any language.</p>
        </div>

        <div className="rounded-2xl bg-[#080b10] border border-slate-800 overflow-hidden shadow-2xl">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-800">
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg">
              {(['curl', 'typescript', 'python'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setCodeTab(lang)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors capitalize ${
                    codeTab === lang ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-6 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
            {CODE_EXAMPLES[codeTab]}
          </pre>
        </div>
      </section>

      {/* ── Provider Network Grid ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">10 Providers. One Wallet.</h2>
          <p className="text-slate-400 text-sm">All priced at wholesale rates. No negotiation. No markup.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PROVIDERS.map(p => (
            <div
              key={p.name}
              className="rounded-xl bg-[#121620] border border-slate-800 hover:border-slate-700 p-4 flex flex-col items-center gap-2 text-center transition-colors group"
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="font-semibold text-white text-xs group-hover:text-emerald-400 transition-colors">{p.name}</span>
              <span className="text-[10px] text-slate-500">{p.cat}</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                <span className="font-mono text-[10px] text-emerald-400 font-bold">{p.cost}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-600 font-mono text-xs mt-6">
          + BYOK (Bring Your Own Keys) — use your own provider keys for $0.00 wallet cost
        </p>
      </section>

      {/* ── Pricing Transparency ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              Zero Markup Guarantee
            </div>
            <h2 className="text-3xl font-bold text-white">You Pay Exactly What We Pay</h2>
            <p className="text-slate-400 leading-relaxed">
              LiteDaemon is a transparent pass-through gateway. We charge you exactly the wholesale cost each provider charges us — not a cent more. Our revenue comes from infrastructure efficiency, not margin stacking.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs pt-4">
              {[
                { label: 'Platform Markup', value: '0%', color: 'text-emerald-400' },
                { label: 'Hidden Fees', value: 'None', color: 'text-emerald-400' },
                { label: 'Subscription Required', value: 'Never', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/10">
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-slate-500 text-[10px] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Ready to simplify your stack?
        </h2>
        <p className="text-slate-400 mb-10 text-lg">
          Get your API key in 10 seconds. Deposit $5. Start calling 10 AI infrastructure providers instantly.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-2xl shadow-emerald-500/25"
        >
          <Zap className="w-5 h-5" />
          Get Your Free API Key
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-slate-600 text-xs font-mono mt-4">No credit card required to sign up. No subscription ever.</p>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs font-mono text-slate-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 font-semibold">LiteDaemon</span>
        </div>
        OpenRouter for AI Agents & Tools · Zero Markup Infrastructure · v1.0
      </footer>
    </div>
  );
};
