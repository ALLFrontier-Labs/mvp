import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Check, Copy, ChevronRight, Shield,
  DollarSign, Globe, Cpu, Search, Layout, Code2,
  Wallet, Key, X, Layers, Activity, RefreshCw, Sparkles
} from 'lucide-react';

// ── Code example snippets ─────────────────────────────────────────────────────
const CODE_EXAMPLES = {
  curl: `# ONE unified endpoint. 30+ providers. Zero markup.
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/scrape \\
  -H "Authorization: Bearer ld_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"provider": "firecrawl", "params": {"url": "https://example.com"}}'

# Search (routes via Tavily / Exa / Serper BYOK)
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/search \\
  -H "Authorization: Bearer ld_your_key" \\
  -d '{"provider": "tavily", "params": {"query": "latest AI news 2026"}}'

# Code execution sandbox
curl -X POST https://mvp-production-c1e8.up.railway.app/v1/execute \\
  -H "Authorization: Bearer ld_your_key" \\
  -d '{"provider": "e2b", "params": {"code": "print(\\"Hello Sandbox!\\")"}}'`,

  typescript: `// Standard fetch — no SDK required
const BASE = "https://mvp-production-c1e8.up.railway.app";
const KEY  = "ld_your_key";

const headers = {
  "Authorization": \`Bearer \${KEY}\`,
  "Content-Type":  "application/json",
};

// Scrape any URL via BYOK provider
const { result } = await fetch(\`\${BASE}/v1/scrape\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ provider: "firecrawl", params: { url: "https://example.com" } }),
}).then(r => r.json());

// Search web
const { result: searchResult } = await fetch(\`\${BASE}/v1/search\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ provider: "tavily", params: { query: "AI agents 2026" } }),
}).then(r => r.json());`,

  python: `import requests

BASE = "https://mvp-production-c1e8.up.railway.app"
KEY  = "ld_your_key"
H    = {"Authorization": f"Bearer {KEY}"}

# Scrape web page
res = requests.post(f"{BASE}/v1/scrape",
    headers=H, json={"provider": "firecrawl", "params": {"url": "https://example.com"}})
print(res.json()["result"]["markdown"])

# Execute code sandbox
res = requests.post(f"{BASE}/v1/execute",
    headers=H, json={"provider": "e2b", "params": {"code": "print('Hello!')"}})
print(res.json()["result"])`,
};

const PROVIDERS = [
  { name: 'Firecrawl',    cat: 'Scraping',  cost: 'BYOK', dot: 'bg-emerald-400', icon: '🔥' },
  { name: 'Jina AI',      cat: 'Scraping',  cost: 'BYOK', dot: 'bg-emerald-400', icon: '⚡' },
  { name: 'Apify',        cat: 'Crawling',  cost: 'BYOK', dot: 'bg-emerald-400', icon: '🤖' },
  { name: 'Spider Cloud', cat: 'Crawling',  cost: 'BYOK', dot: 'bg-emerald-400', icon: '🕷️' },
  { name: 'Tavily',       cat: 'Search',    cost: 'BYOK', dot: 'bg-teal-400',    icon: '🔍' },
  { name: 'Exa AI',       cat: 'Search',    cost: 'BYOK', dot: 'bg-teal-400',    icon: '🧠' },
  { name: 'Serper.dev',   cat: 'Search',    cost: 'BYOK', dot: 'bg-teal-400',    icon: '📊' },
  { name: 'Browserbase',  cat: 'Browser',   cost: 'BYOK', dot: 'bg-cyan-400',    icon: '🌐' },
  { name: 'Steel Browser',cat: 'Browser',   cost: 'BYOK', dot: 'bg-cyan-400',    icon: '🛡️' },
  { name: 'E2B Sandbox',  cat: 'Execute',   cost: 'BYOK', dot: 'bg-purple-400',  icon: '💻' },
  { name: 'Daytona',      cat: 'Execute',   cost: 'BYOK', dot: 'bg-purple-400',  icon: '⚡' },
  { name: 'LlamaParse',   cat: 'Document',  cost: 'BYOK', dot: 'bg-amber-400',   icon: '📄' },
  { name: 'Unstructured', cat: 'Document',  cost: 'BYOK', dot: 'bg-amber-400',   icon: '📂' },
  { name: 'BrightData',   cat: 'Scraping',  cost: 'BYOK', dot: 'bg-emerald-400', icon: '🌐' },
  { name: 'Perplexity',   cat: 'Search',    cost: 'BYOK', dot: 'bg-teal-400',    icon: '✨' },
];

export const Landing: React.FC = () => {
  const [codeTab, setCodeTab] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copied, setCopied]   = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[codeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 overflow-x-hidden font-sans">

      {/* ── Top Navigation ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0a0d14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">LiteDaemon</span>
          </Link>
          <div className="flex items-center gap-4 font-mono text-xs">
            <Link to="/providers" className="text-slate-400 hover:text-white transition-colors hidden sm:block">
              Browse Providers
            </Link>
            <Link to="/auth" className="text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              Get API Key <ArrowRight className="w-3.5 h-3.5" />
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
            Unified BYOK Gateway for AI Infrastructure
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            One Gateway.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              30+ AI Tools.
            </span>
            <br />Zero Platform Markup.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Stop managing scattered API subscriptions. Route through your own API keys across 30+ tools with zero platform markup and automatic multi-key failover handling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 font-mono text-sm">
            <Link
              to="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-xl shadow-emerald-500/25"
            >
              <Key className="w-4 h-4" />
              Get Started for Free
            </Link>
            <Link
              to="/providers"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Explore 30+ Providers
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          {/* Quick trust stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-400">
            {[
              { icon: Activity, text: '30+ Providers Live' },
              { icon: Shield,   text: '0% Platform Markup' },
              { icon: Key,      text: 'BYOK Support' },
              { icon: RefreshCw,text: 'Zero-Downtime Failovers' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-emerald-400" />
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
                <li key={s.service} className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/10 font-mono text-xs">
                  <div>
                    <span className="font-semibold text-rose-300">{s.service}</span>
                    <span className="text-slate-500 text-xs ml-2 font-sans">{s.detail}</span>
                  </div>
                  <span className="text-rose-400 font-bold">{s.cost}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-rose-500/10 space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between"><span>Monthly cost</span><span className="text-rose-400 font-bold">$165+/mo</span></div>
              <div className="flex justify-between"><span>API keys to manage</span><span className="text-rose-400 font-bold">4+ keys</span></div>
              <div className="flex justify-between"><span>Credit cards</span><span className="text-rose-400 font-bold">4 bills</span></div>
              <div className="flex justify-between"><span>Rate limit outages</span><span className="text-rose-400 font-bold">Frequent</span></div>
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
                { text: '1 Master API Key',            sub: 'works across 30+ providers & AI tools' },
                { text: 'Bring Your Own Keys (BYOK)',  sub: '0% platform reseller markup' },
                { text: 'Unified REST endpoints',     sub: '/v1/scrape, /v1/search, /v1/browser, etc.' },
                { text: 'Multi-key Failover Routing',  sub: 'auto-switch on 429 or provider errors' },
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
              <div className="flex justify-between"><span>Supported Tool Adapters</span><span className="text-emerald-400 font-bold">36 Native</span></div>
              <div className="flex justify-between"><span>Master Key</span><span className="text-emerald-400 font-bold">1 Key</span></div>
              <div className="flex justify-between"><span>Gateway Markup</span><span className="text-emerald-400 font-bold">0%</span></div>
              <div className="flex justify-between"><span>Zero-Downtime Failover</span><span className="text-emerald-400 font-bold">Automatic</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Live in 3 Steps</h2>
          <p className="text-slate-400 font-mono text-sm">No complex SDKs. Just clean REST requests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: Key,
              title: 'Connect Your Keys',
              desc: 'Add your provider API keys to the LiteDaemon vault (Firecrawl, Tavily, E2B, etc.). All keys are encrypted with AES-256.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
            {
              step: '02',
              icon: Zap,
              title: 'Call Unified Endpoints',
              desc: 'Send requests to /v1/scrape, /v1/search, /v1/browser, or /v1/execute using your single Master Bearer Token.',
              color: 'text-teal-400',
              bg: 'bg-teal-500/10 border-teal-500/20',
            },
            {
              step: '03',
              icon: RefreshCw,
              title: 'Automated Failover',
              desc: 'If a primary provider rate limits or errors out, LiteDaemon instantly routes through your backup chain with 0% markup.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
            },
          ].map(s => (
            <div key={s.step} className="relative rounded-2xl bg-[#121620] border border-slate-800 p-6 space-y-4 shadow-xl">
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
          <p className="text-slate-400 text-sm">No provider-specific SDKs. Just standard HTTP requests across all 30+ providers.</p>
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
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-bold text-white">30+ Providers. One Gateway.</h2>
          <p className="text-slate-400 text-sm">Unified execution across scraping, search, browser, document, and sandbox providers.</p>
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
        <p className="text-center text-slate-500 font-mono text-xs mt-6">
          + Bring Your Own Keys (BYOK) — 0% platform reseller markup
        </p>
      </section>

      {/* ── Pricing Transparency ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-8 md:p-12 shadow-2xl">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              Pure BYOK Gateway
            </div>
            <h2 className="text-3xl font-bold text-white">0% Platform Reseller Markup</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LiteDaemon operates as a pure BYOK infrastructure router. Requests use your own direct provider credentials. We never charge hidden markups or force expensive monthly provider reseller bundles.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs pt-4">
              {[
                { label: 'Platform Reseller Markup', value: '0%', color: 'text-emerald-400' },
                { label: 'Supported Providers', value: '30+', color: 'text-emerald-400' },
                { label: 'Free Tier Monthly Calls', value: '1M', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/10">
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-slate-500 text-[10px] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-4xl font-extrabold text-white">
          Ready to unify your AI agent tools?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-base">
          Get your Master API Key in seconds. Connect your BYOK provider keys and enable automatic failover routing.
        </p>
        <div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-2xl shadow-emerald-500/25"
          >
            <Zap className="w-5 h-5" />
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs font-mono text-slate-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 font-semibold">LiteDaemon</span>
        </div>
        Unified BYOK Infrastructure Gateway for AI Agents
      </footer>
    </div>
  );
};
