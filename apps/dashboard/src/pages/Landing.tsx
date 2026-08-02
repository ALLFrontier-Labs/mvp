import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Copy, Check, Code2
} from 'lucide-react';

const FRAMEWORK_SNIPPETS = {
  langchain: `import os
from langchain_community.tools import TavilySearchResults

# 1. Route tool base URL through LiteDaemon Gateway
os.environ["TAVILY_API_BASE"] = "https://litedaemon.xyz/v1"
os.environ["TAVILY_API_KEY"]  = "ld_live_your_master_key"

# 2. Use tool as normal — multi-key failover & vault BYOK are fully automated
tool = TavilySearchResults()
results = tool.invoke({"query": "Autonomous agent tool architectures"})`,

  crewai: `import os
from crewai import Agent
from crewai_tools import SerperDevTool

# 1. Point tool requests to LiteDaemon Gateway
os.environ["HTTP_PROXY"]  = "https://litedaemon.xyz/v1?key=ld_live_your_master_key"
os.environ["HTTPS_PROXY"] = "https://litedaemon.xyz/v1?key=ld_live_your_master_key"

# 2. Run CrewAI agent with zero underlying provider key code changes
researcher = Agent(role="Senior Analyst", tools=[SerperDevTool()])`,

  autogen: `import os
from autogen import AssistantAgent

# 1. Configure AutoGen agent tools to route via LiteDaemon Master Key
tool_config = {
    "base_url": "https://litedaemon.xyz/v1",
    "api_key": "ld_live_your_master_key"
}

assistant = AssistantAgent("researcher", llm_config=tool_config)`,

  n8n: `// In n8n HTTP Request Node Settings:
{
  "method": "POST",
  "url": "https://litedaemon.xyz/v1/scrape",
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
    "https://litedaemon.xyz/v1/search",
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

const TOOL_LOGOS = [
  {
    name: 'Tavily',
    color: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'Exa',
    color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z" />
      </svg>
    ),
  },
  {
    name: 'E2B',
    color: 'bg-amber-950/80 text-amber-400 border-amber-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    name: 'Firecrawl',
    color: 'bg-orange-950/80 text-orange-400 border-orange-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 13.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z" />
      </svg>
    ),
  },
  {
    name: 'Serper',
    color: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    name: 'Browserbase',
    color: 'bg-purple-950/80 text-purple-400 border-purple-800/50',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export const Landing: React.FC = () => {
  const [frameworkTab, setFrameworkTab] = useState<FrameworkTab>('langchain');
  const [copiedFramework, setCopiedFramework] = useState(false);
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveLogoIndex((prev) => (prev + 1) % TOOL_LOGOS.length);
        setIsAnimating(false);
      }, 150);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const currentTool = TOOL_LOGOS[activeLogoIndex];

  const copyFrameworkCode = () => {
    navigator.clipboard.writeText(FRAMEWORK_SNIPPETS[frameworkTab]);
    setCopiedFramework(true);
    setTimeout(() => setCopiedFramework(false), 2000);
  };

  const frameworkLines = FRAMEWORK_SNIPPETS[frameworkTab].split('\n');

  return (
    <div className="min-h-screen font-sans transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="pt-20 pb-8 px-6 max-w-6xl mx-auto text-center space-y-4">
        <h1 className="max-w-6xl mx-auto text-2xl sm:text-4xl lg:text-[48px] font-extrabold tracking-tight text-center leading-tight sm:whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
          The Unified Interface For AI Agent Tools
        </h1>
        <p className="text-xs sm:text-sm max-w-xl mx-auto font-sans" style={{ color: 'var(--text-secondary)' }}>
          Better reliability, better latency, no subscriptions.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4 text-sm font-sans">
          <Link
            to="/auth"
            className="font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-sm flex items-center justify-center min-w-[150px]"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
          >
            Get API Key
          </Link>
          <Link
            to="/providers"
            className="border px-6 py-3 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 font-medium group cursor-pointer min-w-[150px]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <span>Explore Tools</span>
            <span
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 transform ${
                currentTool.color
              } ${
                isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              }`}
              title={currentTool.name}
            >
              {currentTool.icon}
            </span>
          </Link>
        </div>
      </section>

      {/* ── 2. COMPACT STATS ROW ────────────────────────────────────────── */}
      <section className="py-6 max-w-2xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
              100M+
            </div>
            <div className="text-[11px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              Monthly Tool Calls
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
              1M+
            </div>
            <div className="text-[11px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              Global Developers
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
              36+
            </div>
            <div className="text-[11px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              Tool Providers
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
              150+
            </div>
            <div className="text-[11px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              Tool Engines
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED TOOLS & BENTO GRID ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-1.5 cursor-pointer font-sans" style={{ color: 'var(--text-primary)' }}>
            Featured Tools <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </h2>
          <Link to="/providers" className="text-xs flex items-center gap-1 font-mono hover:underline" style={{ color: 'var(--text-muted)' }}>
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-base font-semibold font-sans" style={{ color: 'var(--text-primary)' }}>One API for Any Tool</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
              Access web search, scraping, code sandboxes, and browser automation through a single master endpoint.
            </p>
          </div>

          <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-base font-semibold font-sans" style={{ color: 'var(--text-primary)' }}>Higher Availability</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
              Automatic multi-key failover and key rotation pools to eliminate 429 rate limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-base font-semibold font-sans" style={{ color: 'var(--text-primary)' }}>Price and Performance</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
              Zero monthly subscription fees. Pay-as-you-go micro-routing past free tier.
            </p>
          </div>

          <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-base font-semibold font-sans" style={{ color: 'var(--text-primary)' }}>Custom Data Policies</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
              Ephemeral memory-only routing. Prompt and tool execution payloads are never stored.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS SECTION ──────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10 font-sans border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <span>How It Works</span>
            <span className="font-normal" style={{ color: 'var(--text-muted)' }}>&gt;</span>
          </h2>
          <Link className="text-xs hover:underline transition-colors" style={{ color: 'var(--text-muted)' }} to="/docs">
            Read docs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                <span>1</span>
                <span>Signup</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Create an account to get started. You can set up an org for your team later.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <div className="pl-1" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>

                <div className="w-8 h-8 rounded-lg border flex items-center justify-center hover:opacity-80 transition-colors cursor-pointer" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <svg className="w-4 h-4" style={{ fill: 'var(--text-primary)' }} viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                <span>2</span>
                <span>Connect tool keys</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Add your API keys for <span style={{ color: 'var(--text-primary)' }}>Tavily, Exa, E2B, Browserbase</span> and more.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <div className="pl-1" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <div className="space-y-1.5 font-mono text-xs max-w-[220px]">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <span className="truncate">Tavily Key</span>
                  <span className="text-emerald-500 font-medium text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <span className="truncate">E2B Sandbox</span>
                  <span className="text-emerald-500 font-medium text-[10px]">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                <span>3</span>
                <span>Get your unified key</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Execute all search, browser, and sandbox tools via <span className="font-medium" style={{ color: 'var(--text-primary)' }}>a single master key</span>.
              </p>
            </div>

            <div className="pt-2 space-y-2 max-w-[230px]">
              <div className="pl-1" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              <div className="px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></span>
                <span className="truncate">LITEDAEMON_MASTER_KEY</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg border font-mono text-xs tracking-widest truncate" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                ••••••••••••••••••••••••
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FRAMEWORK QUICKSTARTS ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t space-y-6" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-1.5 font-sans" style={{ color: 'var(--text-primary)' }}>
            Framework Integration <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </h2>
          <Link to="/docs/frameworks" className="text-xs hover:underline flex items-center gap-1 font-mono" style={{ color: 'var(--text-muted)' }}>
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
                className="px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap font-semibold flex items-center gap-2 cursor-pointer"
                style={
                  isActive
                    ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--accent)' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                }
              >
                <Code2 className="w-3.5 h-3.5" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                quickstart.{frameworkTab === 'n8n' ? 'json' : frameworkTab === 'typescript' ? 'ts' : 'py'}
              </span>
            </div>

            <button
              onClick={copyFrameworkCode}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {copiedFramework ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFramework ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono overflow-x-auto leading-relaxed flex" style={{ color: 'var(--text-primary)' }}>
            <div className="select-none text-right pr-4 border-r shrink-0 space-y-1" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {frameworkLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="pl-4 space-y-1 overflow-x-auto flex-1" style={{ color: 'var(--text-primary)' }}>
              {frameworkLines.map((line, i) => (
                <div key={i} className="whitespace-pre">{line}</div>
              ))}
            </div>
          </pre>
        </div>
      </section>

      {/* ── 6. FEATURED ANNOUNCEMENT CARD (OpenRouter Parity) ─────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div 
          className="p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-8 shadow-xl transition-all"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {/* Branded Gateway Artwork Graphic */}
          <div className="shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-tr from-purple-900/60 via-indigo-900/40 to-emerald-900/40 border border-purple-500/30 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/10 blur-xl group-hover:bg-purple-500/20 transition-all" />
            <svg className="w-16 h-16 text-purple-400 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Announcement Copy */}
          <div className="space-y-3 flex-1 text-left">
            <h3 className="text-xl font-bold font-sans tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Unified Tool Engine Gateway on LiteDaemon
            </h3>
            <p className="text-xs leading-relaxed max-w-xl font-sans" style={{ color: 'var(--text-secondary)' }}>
              Tool executions run through the dedicated <code className="px-1.5 py-0.5 rounded font-mono text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }}>/v1/scrape</code>, <code className="px-1.5 py-0.5 rounded font-mono text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }}>/v1/search</code>, and <code className="px-1.5 py-0.5 rounded font-mono text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }}>/v1/execute</code> endpoints with zero-overhead BYOK key failover.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs font-mono">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                New
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
