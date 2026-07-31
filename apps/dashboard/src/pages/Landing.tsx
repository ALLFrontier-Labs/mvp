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
      <section className="pt-20 pb-8 px-6 max-w-5xl mx-auto text-center space-y-4">
        <h1 className="max-w-5xl mx-auto text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-center leading-tight">
          The Unified Interface For AI Agent Tools
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-sans">
          Better reliability, better latency, no subscriptions.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4 text-sm font-sans">
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

      {/* ── 2. COMPACT STATS ROW ────────────────────────────────────────── */}
      <section className="py-6 max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans tracking-tight">
              100M+
            </div>
            <div className="text-[11px] text-zinc-400 font-sans font-medium">
              Monthly Tool Calls
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans tracking-tight">
              1M+
            </div>
            <div className="text-[11px] text-zinc-400 font-sans font-medium">
              Global Developers
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans tracking-tight">
              36+
            </div>
            <div className="text-[11px] text-zinc-400 font-sans font-medium">
              Tool Providers
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans tracking-tight">
              150+
            </div>
            <div className="text-[11px] text-zinc-400 font-sans font-medium">
              Tool Engines
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED TOOLS & BENTO GRID ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
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

      {/* ── 4. EXACT OPENROUTER "HOW IT WORKS" BORDERLESS SECTION ──────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10 font-sans border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
            <span>How It Works</span>
            <span className="text-zinc-500 font-normal">&gt;</span>
          </h2>
          <Link className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors" to="/docs">
            Read docs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Signup */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <span>1</span>
                <span>Signup</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                Create an account to get started. You can set up an org for your team later.
              </p>
            </div>

            {/* User outline & Social Logos Container */}
            <div className="pt-2 space-y-3">
              {/* User Icon Outline */}
              <div className="text-zinc-400 pl-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Colored Social Logos */}
              <div className="flex items-center gap-2">
                {/* Google */}
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800/80 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>

                {/* GitHub */}
                <div className="w-8 h-8 rounded-lg bg-[#24292e] border border-zinc-700/60 flex items-center justify-center hover:bg-[#2c3137] transition-colors cursor-pointer">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>

                {/* Provider / Accent */}
                <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-800/50 flex items-center justify-center hover:bg-orange-900/60 transition-colors cursor-pointer">
                  <span className="text-orange-400 text-xs font-bold">⚡</span>
                </div>

                {/* Email */}
                <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center hover:bg-amber-900/50 transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Connect Provider Keys (BYOK) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <span>2</span>
                <span>Connect tool keys</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                Add your API keys for <span className="text-zinc-200">Tavily, Exa, E2B, Browserbase</span> and more.
              </p>
            </div>

            {/* Key Vault Ledger Mock */}
            <div className="pt-2 space-y-2">
              {/* Shield / Vault Icon */}
              <div className="text-zinc-400 pl-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Provider Key Status Pills */}
              <div className="space-y-1.5 font-mono text-xs max-w-[220px]">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-zinc-900/80 text-zinc-300 border border-zinc-800/80 text-[11px]">
                  <span className="truncate">Tavily Key</span>
                  <span className="text-emerald-400 font-medium text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-zinc-900/80 text-zinc-300 border border-zinc-800/80 text-[11px]">
                  <span className="truncate">E2B Sandbox</span>
                  <span className="text-emerald-400 font-medium text-[10px]">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Get Unified Key */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <span>3</span>
                <span>Get your unified key</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                Execute all search, browser, and sandbox tools via <span className="text-zinc-200 font-medium">a single master key</span>.
              </p>
            </div>

            {/* Master Key Input Pills */}
            <div className="pt-2 space-y-2 max-w-[230px]">
              {/* Key Icon */}
              <div className="text-zinc-400 pl-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              {/* Key Name Pill */}
              <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate">LITEDAEMON_MASTER_KEY</span>
              </div>

              {/* Hidden Token Pill */}
              <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-xs tracking-widest truncate">
                ••••••••••••••••••••••••
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FRAMEWORK QUICKSTARTS ────────────────────────────────────────── */}
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
