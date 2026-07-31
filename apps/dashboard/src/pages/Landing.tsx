import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Check, Copy, ChevronRight, Shield,
  DollarSign, Globe, Cpu, Search, Layout, Code2,
  Wallet, Key, X, Layers, Activity, RefreshCw, Sparkles, Terminal,
  Lock, Server, ShieldCheck, CheckCircle2, Radio, UserPlus, ArrowUpRight
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#09090b] text-slate-100 overflow-x-hidden font-sans selection:bg-[#ccff00] selection:text-black">

      {/* ── Top Navigation (OpenRouter Dark Aesthetic) ───────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-[#09090b] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight font-sans">LiteDaemon</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6 font-mono text-xs">
            <Link to="/providers" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Browse Providers
            </Link>
            <Link to="/auth" className="text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold transition-all shadow-md shadow-[#ccff00]/10"
            >
              Get Master Key
            </Link>
          </div>
        </div>
      </nav>

      {/* ── SPECIFICATION 1: HERO SECTION & COLOR PALETTE ────────────────────── */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-xs mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Unified BYOK Tool Gateway • 1,000 Free Monthly Requests
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6 max-w-4xl mx-auto">
          The Unified Gateway for Autonomous Tool Executions
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Route agent calls across Tavily, Firecrawl, Browserbase, and E2B through a single master key. Multi-key failover, zero payload logging, no monthly subscriptions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs">
          <Link
            to="/auth"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold transition-all shadow-lg shadow-[#ccff00]/10 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-black" />
            Get Master Key
          </Link>
          <Link
            to="/providers"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            Explore Supported Tools →
          </Link>
        </div>

        {/* ── SPECIFICATION 2: 4 SCALE STAT METRICS BAR ────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left font-mono">
          {[
            { metric: '1,000',  label: 'Free Monthly BYOK Calls', icon: Zap,    color: 'text-emerald-400' },
            { metric: '<15ms',  label: 'Gateway Latency Overhead',icon: Activity,color: 'text-teal-400' },
            { metric: '10+',    label: 'Supported Tool Providers',icon: Layers,  color: 'text-cyan-400' },
            { metric: '99.99%', label: 'Failover Route Uptime',  icon: ShieldCheck,color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold uppercase">LIVE METRIC</span>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stat.metric}</div>
              <div className="text-xs text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPECIFICATION 3: BENTO GRID FEATURE CARDS ───────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-800/80">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            High-Performance BYOK Routing Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Scale, Reliability &amp; Privacy
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Everything your autonomous AI agents need to execute search, web scraping, and code sandboxes seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white">One API for Any Agent Tool</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Connect Tavily, Firecrawl, E2B, and Serper through a single proxy endpoint (`/v1/scrape`, `/v1/search`, `/v1/browser`, `/v1/execute`). Stop managing 15+ separate SDKs in your codebase.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white">Automatic Multi-Key Failover</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Higher Reliability — Instant key rotation pools to prevent 429 rate limits and provider outages. When a key hits a quota error, LiteDaemon instantly routes through backup keys with 0ms downtime.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4 hover:border-yellow-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white">1,000 Free BYOK Requests / Mo</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              No monthly lock-ins or mandatory subscriptions. Enjoy 1,000 free monthly BYOK requests (resets 1st of every month at 00:00 UTC). Pay-as-you-go 5% list-price fee only when scaling.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white">Zero-Storage Ephemeral Proxy</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Memory-only routing. Prompt, web content, and tool payloads are never logged or stored. AES-256-GCM encrypted vault architecture protects your underlying provider keys at rest.
            </p>
          </div>
        </div>
      </section>

      {/* ── SPECIFICATION 4: 3-STEP GETTING STARTED VISUAL ───────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-800/80">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            Developer Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-zinc-400 text-sm">No complex setup. Zero ToS violations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-white text-sm font-sans">1. Sign Up</h3>
            <p className="text-zinc-400 font-sans text-xs leading-relaxed">
              Create your account in seconds via GitHub or email login to generate your Master API key.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 font-extrabold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-white text-sm font-sans">2. Connect BYOK Keys</h3>
            <p className="text-zinc-400 font-sans text-xs leading-relaxed">
              Add your provider keys (Tavily, Firecrawl, E2B) into your encrypted vault or top up wallet balance with $5.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-extrabold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-white text-sm font-sans">3. Get Master Key &amp; Run</h3>
            <p className="text-zinc-400 font-sans text-xs leading-relaxed">
              Swap your tool base URL to <code className="text-yellow-300 font-mono">gateway.litedaemon.com/v1</code> and run your agent.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive 3-Line Framework Quickstarts Section ────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-800/80">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            ⚡ 3 Lines of Code • Zero Refactoring
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Plugs Directly Into Your Existing Agent Framework
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Swap your tool base URL or proxy endpoint to <code className="text-emerald-300 font-mono bg-zinc-900 px-1.5 py-0.5 rounded">https://gateway.litedaemon.com/v1</code> and let LiteDaemon handle BYOK keys, rate limits, and multi-key failover automatically.
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
                    ? 'bg-zinc-800 text-white border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-[#0d0d0e] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* macOS Terminal Window Container */}
        <div className="rounded-2xl bg-[#050507] border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-500">
                quickstart.{frameworkTab === 'n8n' ? 'json' : frameworkTab === 'typescript' ? 'ts' : 'py'}
              </span>
            </div>

            <button
              onClick={copyFrameworkCode}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60 transition-colors"
            >
              {copiedFramework ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFramework ? 'Copied!' : 'Copy Snippet'}
            </button>
          </div>

          <pre className="p-6 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed flex">
            <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800/80 shrink-0 space-y-1">
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

      {/* ── OpenRouter-Style BYOK Pricing Section ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-800/80">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            100% Pay-As-You-Go • No Upfront Subscriptions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simple, Transparent BYOK Gateway Pricing
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            Connect your provider keys and route agent executions with zero monthly subscription fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Main Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0d0d0e] to-[#121215] border border-emerald-500/30 p-8 space-y-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500/20 border-b border-l border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold uppercase rounded-bl-xl">
              1,000 Free Requests / Mo
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Base Monthly Subscription</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-zinc-400 text-sm font-mono">/ month</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800 font-mono text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-300 font-semibold">Free Allowance</span>
                  <span className="text-emerald-400 font-bold">1,000 Free Requests/mo</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-300 font-semibold">Allowance Reset</span>
                  <span className="text-zinc-400">1st of Month (00:00 UTC)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-300 font-semibold">Overage Fee (Post 1k calls)</span>
                  <span className="text-teal-400 font-bold">5% BYOK List-Price Fee</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-300 font-semibold">Min Wallet Top-Up</span>
                  <span className="text-white font-bold">$5.00 USD</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/auth"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-sm font-mono transition-all shadow-lg shadow-[#ccff00]/10"
              >
                <Zap className="w-4 h-4 text-black" />
                Start with 1,000 Free BYOK Calls
              </Link>
            </div>
          </div>

          {/* Guarantees Checklist */}
          <div className="rounded-2xl bg-[#0d0d0e] border border-zinc-800 p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">High-Trust Gateway Guarantees</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
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
                <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">{g.title}</span>
                    <span className="text-zinc-400 text-xs">{g.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-2 text-zinc-500 font-mono text-[11px] flex items-center justify-between border-t border-zinc-800">
              <span>LemonSqueezy Wallet Top-Up</span>
              <span className="text-emerald-400 font-bold">100% BYOK Execution</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6 border-t border-zinc-800/80">
        <h2 className="text-4xl font-extrabold text-white">
          Ready to unify your AI agent tools?
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-base">
          Get your Master API Key in seconds. Connect your BYOK provider keys and enable automatic failover routing.
        </p>
        <div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-base font-mono transition-all shadow-xl shadow-[#ccff00]/10"
          >
            <Key className="w-5 h-5 text-black" />
            Get Master Key
            <ArrowRight className="w-5 h-5 text-black" />
          </Link>
        </div>
      </section>

      {/* ── SPECIFICATION 5: ENTERPRISE 4-COLUMN FOOTER ─────────────────────── */}
      <footer className="border-t border-zinc-800 bg-[#09090b] py-12 px-6 font-mono text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 font-sans">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-white text-base">LiteDaemon</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              🟢 All Systems Operational
            </div>
            <p className="text-zinc-500 text-xs">
              © 2026 LiteDaemon Inc. All rights reserved.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/providers" className="hover:text-white transition-colors">Tools &amp; Providers</Link></li>
              <li><Link to="/keys" className="hover:text-white transition-colors">BYOK Vault</Link></li>
              <li><Link to="/providers" className="hover:text-white transition-colors">Multi-Key Failover</Link></li>
              <li><Link to="/billing" className="hover:text-white transition-colors">Pricing &amp; Limits</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Documentation</h4>
            <ul className="space-y-2">
              <li><Link to="/playground" className="hover:text-white transition-colors">Quickstart Guide</Link></li>
              <li><Link to="/providers" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link to="/playground" className="hover:text-white transition-colors">Client SDKs</Link></li>
              <li><Link to="/providers" className="hover:text-white transition-colors">Security Spec</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Company &amp; Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">About</Link></li>
              <li><a href="https://status.litedaemon.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">Status Page <ArrowUpRight className="w-3 h-3 text-zinc-600" /></a></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><a href="https://discord.gg/litedaemon" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">Discord Community <ArrowUpRight className="w-3 h-3 text-zinc-600" /></a></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
};
