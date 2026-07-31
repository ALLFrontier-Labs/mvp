import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Check, Copy, ChevronRight, Shield,
  DollarSign, Globe, Cpu, Search, Layout, Code2,
  Wallet, Key, X, Layers, Activity, RefreshCw, Sparkles, Terminal,
  Lock, Server, ShieldCheck
} from 'lucide-react';

// ── Code example snippets ─────────────────────────────────────────────────────
const CODE_EXAMPLES = {
  curl: `# ONE unified endpoint. 30+ providers. 5% platform fee.
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

const FRAMEWORK_SNIPPETS = {
  langchain: `import os
from langchain_community.tools import TavilySearchResults

# 1. Route tool base URL through LiteDaemon Gateway
os.environ["TAVILY_API_BASE"] = "https://gateway.litedaemon.com/v1"
os.environ["TAVILY_API_KEY"]  = "ld_live_your_master_key"

# 2. Use tool as normal — multi-key failover & vault BYOK are fully automated
tool = TavilySearchResults()
results = tool.invoke({"query": "Autonomous agent tool architectures"})`,

  crewai: `import os
from crewai import Agent
from crewai_tools import SerperDevTool

# 1. Point tool requests to LiteDaemon Gateway
os.environ["HTTP_PROXY"]  = "https://gateway.litedaemon.com/v1?key=ld_live_your_master_key"
os.environ["HTTPS_PROXY"] = "https://gateway.litedaemon.com/v1?key=ld_live_your_master_key"

# 2. Run CrewAI agent with zero underlying provider key code changes
researcher = Agent(role="Senior Analyst", tools=[SerperDevTool()])`,

  autogen: `import os
from autogen import AssistantAgent

# 1. Configure AutoGen agent tools to route via LiteDaemon Master Key
tool_config = {
    "base_url": "https://gateway.litedaemon.com/v1",
    "api_key": "ld_live_your_master_key"
}

assistant = AssistantAgent("researcher", llm_config=tool_config)`,

  n8n: `// In n8n HTTP Request Node Settings:
{
  "method": "POST",
  "url": "https://gateway.litedaemon.com/v1/scrape",
  "headers": {
    "Authorization": "Bearer ld_live_your_master_key",
    "Content-Type": "application/json"
  },
  "body": {
    "url": "https://news.ycombinator.com"
  }
}`,

  python: `import requests

# Single master key routes to Browserbase, Firecrawl, Tavily, E2B, etc.
res = requests.post(
    "https://gateway.litedaemon.com/v1/search",
    headers={"Authorization": "Bearer ld_live_your_master_key"},
    json={"query": "Latest LLM benchmark results"}
)
print(res.json())`,

  typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({ apiKey: 'ld_live_your_master_key' });

// Executed through encrypted vault BYOK key pool
const result = await client.scrape({ url: 'https://example.com' });
console.log(result.data);`,
};

type FrameworkTab = 'langchain' | 'crewai' | 'autogen' | 'n8n' | 'python' | 'typescript';

const PROVIDERS = [
  { name: 'Firecrawl',    cat: 'Scraping',  cost: '5% Fee', dot: 'bg-emerald-400', icon: '🔥' },
  { name: 'Jina AI',      cat: 'Scraping',  cost: '5% Fee', dot: 'bg-emerald-400', icon: '⚡' },
  { name: 'Apify',        cat: 'Crawling',  cost: '5% Fee', dot: 'bg-emerald-400', icon: '🤖' },
  { name: 'Spider Cloud', cat: 'Crawling',  cost: '5% Fee', dot: 'bg-emerald-400', icon: '🕷️' },
  { name: 'Tavily',       cat: 'Search',    cost: '5% Fee', dot: 'bg-teal-400',    icon: '🔍' },
  { name: 'Exa AI',       cat: 'Search',    cost: '5% Fee', dot: 'bg-teal-400',    icon: '🧠' },
  { name: 'Serper.dev',   cat: 'Search',    cost: '5% Fee', dot: 'bg-teal-400',    icon: '📊' },
  { name: 'Browserbase',  cat: 'Browser',   cost: '5% Fee', dot: 'bg-cyan-400',    icon: '🌐' },
  { name: 'Steel Browser',cat: 'Browser',   cost: '5% Fee', dot: 'bg-cyan-400',    icon: '🛡️' },
  { name: 'E2B Sandbox',  cat: 'Execute',   cost: '5% Fee', dot: 'bg-purple-400',  icon: '💻' },
  { name: 'Daytona',      cat: 'Execute',   cost: '5% Fee', dot: 'bg-purple-400',  icon: '⚡' },
  { name: 'LlamaParse',   cat: 'Document',  cost: '5% Fee', dot: 'bg-amber-400',   icon: '📄' },
  { name: 'Unstructured', cat: 'Document',  cost: '5% Fee', dot: 'bg-amber-400',   icon: '📂' },
  { name: 'BrightData',   cat: 'Scraping',  cost: '5% Fee', dot: 'bg-emerald-400', icon: '🌐' },
  { name: 'Perplexity',   cat: 'Search',    cost: '5% Fee', dot: 'bg-teal-400',    icon: '✨' },
];

export const Landing: React.FC = () => {
  const [codeTab, setCodeTab]           = useState<'curl' | 'typescript' | 'python'>('curl');
  const [frameworkTab, setFrameworkTab] = useState<FrameworkTab>('langchain');
  const [copied, setCopied]             = useState(false);
  const [copiedFramework, setCopiedFramework] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[codeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyFrameworkCode = () => {
    navigator.clipboard.writeText(FRAMEWORK_SNIPPETS[frameworkTab]);
    setCopiedFramework(true);
    setTimeout(() => setCopiedFramework(false), 2000);
  };

  const frameworkLines = FRAMEWORK_SNIPPETS[frameworkTab].split('\n');

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
              Get API Key &amp; Add Funds <ArrowRight className="w-3.5 h-3.5" />
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
            Unified BYOK Gateway (5% Platform Fee)
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            One Gateway.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              30+ AI Tools.
            </span>
            <br />Flat 5% BYOK Platform Fee.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Route 30+ AI tool APIs through your own keys with zero-downtime failovers for a flat 5% platform fee based on list price from call #1.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 font-mono text-sm">
            <Link
              to="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-xl shadow-emerald-500/25"
            >
              <Key className="w-4 h-4" />
              Get API Key &amp; Add Funds
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
              { icon: Shield,   text: '5% Micro-Fee on BYOK Requests' },
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

      {/* ── Interactive Comparison Table (Without vs With LiteDaemon) ──────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-bold text-white">Manual Setup vs. LiteDaemon BYOK Gateway</h2>
          <p className="text-slate-400 text-sm">Why agentic developers switch to a single unified tool gateway.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0d1117] shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-xs uppercase tracking-wider">
                <th className="p-4 font-bold text-slate-300">Feature / Bottleneck</th>
                <th className="p-4 font-bold text-rose-400 bg-rose-950/20">Without LiteDaemon (Manual Setup)</th>
                <th className="p-4 font-bold text-emerald-400 bg-emerald-950/20">With LiteDaemon (BYOK Gateway)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {[
                {
                  feature: 'Provider Rate Limits (429s)',
                  without: 'Agent crashes instantly mid-run & fails customer workflow',
                  with: 'Automatic zero-downtime failover to backup provider',
                  color: 'text-emerald-300 font-bold',
                },
                {
                  feature: 'API Integration',
                  without: '30+ separate SDKs, schemas & custom tool wrappers',
                  with: '5 predictable endpoints (/v1/scrape, /v1/search, etc.)',
                  color: 'text-emerald-300 font-bold',
                },
                {
                  feature: 'API Key Management',
                  without: 'Storing & rotating 10+ raw provider keys in env files',
                  with: '1 unified LiteDaemon master key for all 30+ tools',
                  color: 'text-emerald-300 font-bold',
                },
                {
                  feature: 'Observability',
                  without: 'Logging into 10+ separate provider dashboards to debug',
                  with: 'Single dashboard for unified execution logs & latency metrics',
                  color: 'text-emerald-300 font-bold',
                },
                {
                  feature: 'Pricing & Commitment',
                  without: 'Fixed monthly subscriptions per tool ($165+/mo minimums)',
                  with: 'Pay 5% routing fee per request via BYOK ($0 monthly subs)',
                  color: 'text-emerald-300 font-bold',
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-white whitespace-nowrap">{row.feature}</td>
                  <td className="p-4 text-rose-300/90 bg-rose-950/10 font-sans">{row.without}</td>
                  <td className={`p-4 bg-emerald-950/10 font-sans ${row.color}`}>{row.with}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              desc: 'If a primary provider rate limits or errors out, LiteDaemon instantly routes through your backup chain for a flat 5% fee.',
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
          + Bring Your Own Keys (BYOK) — Flat 5% platform fee based on standard list prices
        </p>
      </section>

      {/* ── Why LiteDaemon? Section ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono mb-2">
            <Zap className="w-3.5 h-3.5" />
            Fail-Safe Agent Infrastructure
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Why Developers Route Through LiteDaemon?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            The invisible fail-safe gateway for autonomous AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-[#121620] border border-slate-800 hover:border-emerald-500/40 p-6 space-y-4 shadow-xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero 429 Rate-Limit Crashes</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              When a provider rate-limits your agent mid-execution, LiteDaemon's multi-key failover automatically routes to a backup key or secondary provider with 0ms downtime.
            </p>
          </div>

          <div className="rounded-2xl bg-[#121620] border border-slate-800 hover:border-teal-500/40 p-6 space-y-4 shadow-xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Key className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white">1 Unified Master Key</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Stop cluttering your .env file with 15+ API keys. Use one single <code className="text-teal-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">ld_live_...</code> key across your entire codebase for searching, scraping, browsers, and sandboxes.
            </p>
          </div>

          <div className="rounded-2xl bg-[#121620] border border-slate-800 hover:border-cyan-500/40 p-6 space-y-4 shadow-xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero Code Revamp</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Plugs into existing LangChain, CrewAI, AutoGen, or custom Python/TypeScript scripts by updating a single base URL string.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive 3-Line Framework Quickstarts Section ────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            ⚡ 3 Lines of Code • Zero Refactoring
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Plugs Directly Into Your Existing Agent Framework
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Swap your tool base URL or proxy endpoint to <code className="text-emerald-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">https://gateway.litedaemon.com/v1</code> and let LiteDaemon handle BYOK keys, rate limits, and multi-key failover automatically.
          </p>
        </div>

        {/* Tabbed Framework Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none font-mono text-xs">
          {[
            { id: 'langchain',  label: 'LangChain' },
            { id: 'crewai',     label: 'CrewAI' },
            { id: 'autogen',    label: 'AutoGen' },
            { id: 'n8n',        label: 'n8n / Webhook' },
            { id: 'python',     label: 'Python' },
            { id: 'typescript', label: 'TypeScript' },
          ].map((tab) => {
            const isActive = frameworkTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFrameworkTab(tab.id as FrameworkTab)}
                className={`px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap font-semibold flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800 text-white border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-[#121620]/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* macOS Terminal Window Container */}
        <div className="rounded-2xl bg-[#080b10] border border-slate-800 overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-500">
                quickstart.{frameworkTab === 'n8n' ? 'json' : frameworkTab === 'typescript' ? 'ts' : 'py'}
              </span>
            </div>

            <button
              onClick={copyFrameworkCode}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 transition-colors"
            >
              {copiedFramework ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFramework ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>

          {/* Syntax-Highlighted Code Block with Line Numbers */}
          <pre className="p-6 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed flex">
            <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 shrink-0 space-y-1">
              {frameworkLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="pl-4 space-y-1 text-emerald-300 overflow-x-auto flex-1">
              {frameworkLines.map((line, i) => (
                <div key={i} className="whitespace-pre">{line}</div>
              ))}
            </div>
          </pre>
        </div>
      </section>

      {/* ── Enterprise-Grade Security & Vault Architecture ───────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="rounded-2xl bg-gradient-to-b from-[#0d1117] to-[#121620] border border-slate-800 p-8 md:p-12 shadow-2xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              SOC-2 Ready Architecture • AES-256 Encrypted
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Your API Keys &amp; Data Payloads Never Leave Memory
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Built with zero-retention ephemeral proxies so your private agent workflows stay private.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>AES-256-GCM Vault Encryption</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Provider API keys stored in your dashboard are encrypted at rest using AES-256-GCM with isolated user-specific decryption keys. Plaintext keys are never exposed.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-teal-500/30 transition-colors">
              <div className="flex items-center gap-2.5 text-teal-400 font-bold text-sm">
                <Server className="w-4 h-4" />
                <span>Ephemeral In-Memory Proxying (Zero Payload Logging)</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                LiteDaemon is a strict pass-through proxy. Scraped web content, browser execution steps, and search query payloads stream strictly through isolated in-memory pipes. We NEVER save or log payload contents.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Key Isolation &amp; Restrictive Scopes</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Your master <code className="text-cyan-300 font-mono bg-slate-950 px-1 py-0.5 rounded">ld_live_...</code> key only authorizes routing through your encrypted vault. Intercepting a master key provides zero access to underlying provider accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OpenRouter-Style BYOK Pricing Section ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            100% Pay-As-You-Go • No Upfront Subscriptions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simple, Transparent BYOK Gateway Pricing
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Connect your provider keys and route agent executions with zero monthly subscription fees.
          </p>
        </div>

        {/* Pricing Card & Guarantees Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Main OpenRouter-Style Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0d1117] to-[#121620] border border-emerald-500/30 p-8 space-y-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500/20 border-b border-l border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold uppercase rounded-bl-xl">
              1,000 Free Requests / Mo
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono uppercase text-slate-500 tracking-wider">Base Monthly Subscription</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-slate-400 text-sm font-mono">/ month</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800 font-mono text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Free Allowance</span>
                  <span className="text-emerald-400 font-bold">1,000 Free Requests/mo</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Allowance Reset</span>
                  <span className="text-slate-400">1st of Month (00:00 UTC)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Overage Fee (Post 1k calls)</span>
                  <span className="text-teal-400 font-bold">5% BYOK List-Price Fee</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Min Wallet Top-Up</span>
                  <span className="text-white font-bold">$5.00 USD</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/auth"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4" />
                Start with 1,000 Free BYOK Calls
              </Link>
            </div>
          </div>

          {/* High-Trust Guarantees Checklist */}
          <div className="rounded-2xl bg-[#0d1117] border border-slate-800 p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">High-Trust Gateway Guarantees</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Everything you need to run high-concurrency autonomous agent workflows safely.
              </p>
            </div>

            <ul className="space-y-4 text-xs font-sans">
              {[
                {
                  title: 'Zero monthly lock-in',
                  desc: 'Pay only for what you proxy past 1,000 free monthly calls.',
                },
                {
                  title: 'Ephemeral memory-only routing',
                  desc: 'Zero payload, prompt, or web scraping result logging.',
                },
                {
                  title: 'Multi-key rotation pools',
                  desc: 'Automated 429 rate-limit failovers across prioritized & fallback keys.',
                },
                {
                  title: 'Instant framework integration',
                  desc: 'Works out-of-the-box with LangChain, CrewAI, AutoGen, and n8n.',
                },
              ].map((g, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">{g.title}</span>
                    <span className="text-slate-400 text-xs">{g.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-2 text-slate-500 font-mono text-[11px] flex items-center justify-between border-t border-slate-800/80">
              <span>LemonSqueezy Wallet Top-Up</span>
              <span className="text-emerald-400 font-bold">100% BYOK Execution</span>
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
            Get API Key &amp; Add Funds
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
