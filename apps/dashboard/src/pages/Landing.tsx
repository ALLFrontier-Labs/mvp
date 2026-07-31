import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Copy, Check, Code2
} from 'lucide-react';

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

const PROVIDER_LOGOS = [
  { name: 'Anthropic', icon: '⚡' },
  { name: 'OpenAI', icon: '🌀' },
  { name: 'Google', icon: '✦' },
  { name: 'Meta', icon: '♾️' },
  { name: 'DeepSeek', icon: '🤖' },
];

export const Landing: React.FC = () => {
  const [frameworkTab, setFrameworkTab] = useState<FrameworkTab>('langchain');
  const [copiedFramework, setCopiedFramework] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % PROVIDER_LOGOS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const copyFrameworkCode = () => {
    navigator.clipboard.writeText(FRAMEWORK_SNIPPETS[frameworkTab]);
    setCopiedFramework(true);
    setTimeout(() => setCopiedFramework(false), 2000);
  };

  const frameworkLines = FRAMEWORK_SNIPPETS[frameworkTab].split('\n');

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">

      {/* ── HERO SECTION (Pixel-Perfect OpenRouter Parity) ─────────────── */}
      <section className="pt-20 pb-12 px-6 max-w-5xl mx-auto text-center space-y-4">
        <h1 className="max-w-5xl mx-auto text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-center leading-tight">
          The Unified Interface For AI Agent Tools
        </h1>
        <p className="text-zinc-400 text-center text-lg mt-3 font-sans font-normal">
          Better <span className="text-white underline decoration-zinc-600 underline-offset-4">reliability</span>, better <span className="text-white underline decoration-zinc-600 underline-offset-4">latency</span>, no subscriptions.
        </p>

        <div className="flex items-center justify-center gap-3 pt-6 text-sm font-sans">
          <Link
            to="/auth"
            className="bg-[#ccff00] text-black font-extrabold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-all shadow-sm"
          >
            Get API Key
          </Link>
          <Link
            to="/providers"
            className="bg-zinc-900/60 border border-zinc-800 text-zinc-200 px-5 py-2.5 rounded-xl text-sm hover:bg-zinc-800/80 transition-all flex items-center gap-2 font-semibold"
          >
            <span>Explore Tools</span>
            <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs transition-transform duration-300 scale-105">
              {PROVIDER_LOGOS[logoIndex].icon}
            </span>
          </Link>
        </div>
      </section>

      {/* ── 3. BORDERLESS STATS ROW (Floating Numbers Format) ─────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-5xl font-extrabold text-zinc-100 font-sans tracking-tight">100M+</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium font-sans">Monthly Tool Calls</div>
          </div>
          <div>
            <div className="text-3xl md:text-5xl font-extrabold text-zinc-100 font-sans tracking-tight">1M+</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium font-sans">Global Developers</div>
          </div>
          <div>
            <div className="text-3xl md:text-5xl font-extrabold text-zinc-100 font-sans tracking-tight">36+</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium font-sans">Tool Providers</div>
          </div>
          <div>
            <div className="text-3xl md:text-5xl font-extrabold text-zinc-100 font-sans tracking-tight">150+</div>
            <div className="text-xs text-zinc-400 mt-1 font-medium font-sans">Tool Engines</div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED TOOLS & BENTO GRID ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        
        {/* Section Header Standard */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-1.5 cursor-pointer hover:text-zinc-300 font-sans">
            Featured Tools <ChevronRight className="w-4 h-4 text-zinc-400" />
          </h2>
          <Link to="/providers" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
            View all &rarr;
          </Link>
        </div>

        {/* 2x2 Bento Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="text-base font-semibold text-white font-sans">One API for Any Tool</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Access web search, scraping, code sandboxes, and browser automation through a single master endpoint.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="text-base font-semibold text-white font-sans">Higher Availability</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Automatic multi-key failover and key rotation pools to eliminate 429 rate limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="text-base font-semibold text-white font-sans">Price and Performance</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Zero monthly subscription fees. Pay-as-you-go micro-routing past free tier.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="text-base font-semibold text-white font-sans">Custom Data Policies</h3>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Ephemeral memory-only routing. Prompt and tool execution payloads are never stored.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS (3 Simple Steps) ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-800/80 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-1.5 font-sans">
            How It Works <ChevronRight className="w-4 h-4 text-zinc-400" />
          </h2>
          <Link to="/docs" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
            Read docs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="font-bold text-white text-sm">1. Sign Up</h3>
            <p className="text-zinc-400 leading-relaxed">
              Create an account via GitHub or Google in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="font-bold text-white text-sm">2. Add BYOK Keys</h3>
            <p className="text-zinc-400 leading-relaxed">
              Connect your provider keys or top up wallet balance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-2">
            <h3 className="font-bold text-white text-sm">3. Get Master Key</h3>
            <p className="text-zinc-400 leading-relaxed">
              Swap your tool base URL to <code className="text-emerald-400 font-mono">https://gateway.litedaemon.com/v1</code> and execute.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. FRAMEWORK QUICKSTARTS ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-800/80 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-1.5 font-sans">
            Framework Integration <ChevronRight className="w-4 h-4 text-zinc-400" />
          </h2>
          <Link to="/docs/frameworks" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
            SDK docs &rarr;
          </Link>
        </div>

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
                className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap font-semibold flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white border-emerald-500/50'
                    : 'bg-[#0d0d0e] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-[#050507] border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-500">
                quickstart.{frameworkTab === 'n8n' ? 'json' : frameworkTab === 'typescript' ? 'ts' : 'py'}
              </span>
            </div>

            <button
              onClick={copyFrameworkCode}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
            >
              {copiedFramework ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFramework ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed flex">
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

    </div>
  );
};
