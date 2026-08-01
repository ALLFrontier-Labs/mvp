import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Copy, Check, ChevronRight, Github, MessageSquare,
  Zap, Lock, ShieldCheck, Layers, Cpu, CreditCard,
  FileText, Lightbulb, AlertTriangle, BookOpen,
  Terminal, ExternalLink, ArrowRight, Search,
  Rocket, Box, Code2, Book, ArrowDown, Server, Key
} from 'lucide-react';
import { PROVIDER_META } from '../data/providers';

type Lang = 'python' | 'typescript' | 'curl';
type DocTab = 'docs' | 'api-reference' | 'sdks';
type SectionId =
  | 'quickstart'
  | 'architecture'
  | 'principles'
  | 'keys-vault'
  | 'key-encryption'
  | 'failover'
  | 'tools'
  | 'api-ref'
  | 'sdk-ts'
  | 'sdk-python'
  | 'langchain'
  | 'crewai'
  | 'autogen';

/* ─── Code Block Component ────────────────────────────────────────────────── */
const CodeBlock: React.FC<{
  code: Record<Lang, string>;
  filename?: string;
}> = ({ code, filename }) => {
  const [lang, setLang] = useState<Lang>('python');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ext = { python: 'py', typescript: 'ts', curl: 'sh' };
  const lines = code[lang].split('\n');

  return (
    <div className="my-6 rounded-2xl overflow-hidden text-xs font-mono shadow-xl bg-zinc-950 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {filename && (
            <span className="text-[11px] font-mono text-zinc-400">
              {filename}.{ext[lang]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            {(['python', 'typescript', 'curl'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[10px] font-bold capitalize cursor-pointer ${
                  lang === l
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {l === 'typescript' ? 'TypeScript' : l === 'python' ? 'Python' : 'cURL'}
              </button>
            ))}
          </div>

          {/* Copy Button */}
          <button
            onClick={copy}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex overflow-x-auto p-4 text-emerald-400 leading-relaxed">
        <div className="select-none text-right pr-4 border-r border-zinc-800 mr-4 shrink-0 space-y-[1px] text-[11px] text-zinc-600">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="flex-1 text-[11px] leading-relaxed overflow-x-auto">
          {lines.map((line, i) => <div key={i} className="whitespace-pre">{line || ' '}</div>)}
        </pre>
      </div>
    </div>
  );
};

/* ─── Colorful Callout Component ─────────────────────────────────────────── */
const Callout: React.FC<{
  type: 'tip' | 'warning' | 'info' | 'danger';
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const styles = {
    tip:     { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-300', icon: Lightbulb },
    warning: { bg: 'bg-amber-500/10 dark:bg-amber-500/15',   border: 'border-amber-500/30',   text: 'text-amber-700 dark:text-amber-300',   icon: AlertTriangle },
    info:    { bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',     border: 'border-cyan-500/30',    text: 'text-cyan-700 dark:text-cyan-300',     icon: BookOpen },
    danger:  { bg: 'bg-rose-500/10 dark:bg-rose-500/15',     border: 'border-rose-500/30',    text: 'text-rose-700 dark:text-rose-300',     icon: Lock },
  };
  const s = styles[type];
  const Icon = s.icon;

  return (
    <div className={`my-5 p-4 rounded-2xl border ${s.bg} ${s.border} flex items-start gap-3 text-xs leading-relaxed font-sans`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.text}`} />
      <div className="space-y-1">
        {title && <strong className={`font-bold block text-sm ${s.text}`}>{title}</strong>}
        <div className="text-zinc-700 dark:text-zinc-300">{children}</div>
      </div>
    </div>
  );
};

export const Docs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DocTab>('docs');
  const [activeSection, setActiveSection] = useState<SectionId>('quickstart');

  // Sidebar Menu Navigation Structure
  const NAVIGATION_GROUPS = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'quickstart', label: 'Quickstart Guide' },
        { id: 'architecture', label: 'System Architecture' },
        { id: 'principles', label: 'Core Principles' },
      ],
    },
    {
      group: 'AUTHENTICATION & KEYS',
      items: [
        { id: 'keys-vault', label: 'API Keys & Vault' },
        { id: 'key-encryption', label: 'Key Encryption' },
        { id: 'failover', label: 'Multi-Key Failover' },
      ],
    },
    {
      group: 'TOOL PROVIDERS & APIS',
      items: [
        { id: 'tools', label: 'Supported Providers (36+)' },
        { id: 'api-ref', label: 'API Reference' },
      ],
    },
    {
      group: 'OFFICIAL SDKS',
      items: [
        { id: 'sdk-ts', label: 'TypeScript / Node.js' },
        { id: 'sdk-python', label: 'Python SDK' },
      ],
    },
    {
      group: 'FRAMEWORK INTEGRATIONS',
      items: [
        { id: 'langchain', label: 'LangChain' },
        { id: 'crewai', label: 'CrewAI' },
        { id: 'autogen', label: 'AutoGen' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans selection:bg-lime-400 selection:text-zinc-950">

      {/* ── TOP HEADER & SUB-NAVIGATION BAR ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-lime-600 dark:text-lime-400" />
            <span>Developer Documentation</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Complete technical guides, API references, SDK documentation, and architecture specifications.
          </p>
        </div>

        {/* Top Sub-Nav Tabs & Links */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto font-mono text-xs">
          <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {(['docs', 'api-reference', 'sdks'] as DocTab[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === t
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {t === 'docs' ? 'Guides' : t === 'api-reference' ? 'API Reference' : 'SDKs'}
              </button>
            ))}
          </div>

          <a
            href="https://github.com/ALLFrontier-Labs/mvp"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── RESPONSIVE LAYOUT SHELL (SIDEBAR + MAIN + TOC) ─────────────────── */}
      <div className="flex gap-8 items-start pt-2">

        {/* ── LEFT STICKY SIDEBAR NAVIGATION TREE ────────────────────────────── */}
        <aside className="w-64 shrink-0 font-mono text-xs hidden lg:block sticky top-24 space-y-6">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.group} className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-2">
                {group.group}
              </span>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as SectionId)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-lime-500/10 text-lime-600 dark:text-lime-400 font-extrabold border-r-2 border-lime-400'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-lime-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* ── MAIN CONTENT AREA ───────────────────────────────────────────────── */}
        <main className="max-w-4xl flex-1 space-y-10 py-2 font-sans">
          
          {/* SECTION 1: QUICKSTART GUIDE */}
          {activeSection === 'quickstart' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OVERVIEW / GUIDES</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Quickstart Guide</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Start executing unified scraping, search, browser, code sandbox, and document parsing calls in under 3 minutes.
                </p>
              </div>

              <Callout type="tip" title="Bring Your Own Keys (BYOK) Autonomy">
                LiteDaemon routes requests directly using your configured provider keys with 0% gateway markup fees. Downstream provider keys are encrypted client-side using AES-256-GCM.
              </Callout>

              {/* Step 1 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center">1</span>
                  Create Your Account &amp; Obtain Workspace Access
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Sign up for a LiteDaemon workspace. Your workspace includes 1,000 free metered routing calls for testing.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center">2</span>
                  Vault Your Provider Keys (<Link to="/vault" className="text-lime-600 dark:text-lime-400 hover:underline">/vault</Link>)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Navigate to the <Link to="/vault" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">Key Vault</Link> page and add your API keys for Tavily, Firecrawl, E2B, Steel, or Exa. You can configure multiple keys per provider for automatic failover.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center">3</span>
                  Get Master Gateway API Key (<Link to="/settings" className="text-lime-600 dark:text-lime-400 hover:underline">/settings</Link>)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Copy your Master Gateway API Key from the <Link to="/settings" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">Settings</Link> page. This key uses SHA-256 hashing for instant gateway authentication.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center">4</span>
                  Make Your First Request
                </h3>
                <CodeBlock
                  filename="quickstart_example"
                  code={{
                    python: `import httpx

client = httpx.Client(base_url="https://mvp-production-c1e8.up.railway.app")
response = client.post(
    "/v1/search",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"query": "latest LLM reasoning benchmarks 2026", "limit": 5}
)
print(response.json())`,
                    typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const daemon = new LiteDaemon({ apiKey: 'YOUR_LITEDAEMON_KEY' });
const results = await daemon.search({
  query: 'latest LLM reasoning benchmarks 2026',
  limit: 5
});
console.log(results);`,
                    curl: `curl -X POST https://mvp-production-c1e8.up.railway.app/v1/search \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "latest LLM reasoning benchmarks 2026", "limit": 5}'`
                  }}
                />
              </div>
            </div>
          )}

          {/* SECTION 2: SYSTEM ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OVERVIEW / ARCHITECTURE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">System Architecture</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  How LiteDaemon routes, authenticates, decrypts, and executes client requests with zero plaintext logging.
                </p>
              </div>

              {/* Interactive Visual Node Diagram */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 space-y-6 font-mono text-xs shadow-2xl">
                <span className="text-lime-400 font-bold uppercase tracking-wider block text-[11px]">
                  ⚡ Real-Time End-to-End Execution Flow
                </span>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 w-full md:w-auto">
                    <span className="text-zinc-400 text-[10px] block">CLIENT</span>
                    <span className="font-bold text-white block">SDK / cURL</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-lime-400 shrink-0 hidden md:block" />
                  <ArrowDown className="w-5 h-5 text-lime-400 shrink-0 md:hidden" />

                  <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-lime-400 text-[10px] block">GATEWAY</span>
                    <span className="font-bold text-lime-300 block">LiteDaemon Node</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-lime-400 shrink-0 hidden md:block" />
                  <ArrowDown className="w-5 h-5 text-lime-400 shrink-0 md:hidden" />

                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-cyan-400 text-[10px] block">SECURITY</span>
                    <span className="font-bold text-cyan-300 block">SHA-256 Auth</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-lime-400 shrink-0 hidden md:block" />
                  <ArrowDown className="w-5 h-5 text-lime-400 shrink-0 md:hidden" />

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-purple-400 text-[10px] block">VAULT</span>
                    <span className="font-bold text-purple-300 block">AES-256 Decrypt</span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-lime-400 shrink-0 hidden md:block" />
                  <ArrowDown className="w-5 h-5 text-lime-400 shrink-0 md:hidden" />

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-emerald-400 text-[10px] block">UPSTREAM</span>
                    <span className="font-bold text-emerald-300 block">Provider API</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-lime-500" /> Minimal Overhead
                  </span>
                  <p className="text-zinc-500 text-[11px] font-sans leading-relaxed">
                    Gateway routing adds only ~12ms mean overhead to upstream API roundtrips.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Zero Plaintext Logs
                  </span>
                  <p className="text-zinc-500 text-[11px] font-sans leading-relaxed">
                    Request payloads and provider API keys are decrypted ephemerally in RAM and never written to disk.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-cyan-500" /> Multi-Region Edge
                  </span>
                  <p className="text-zinc-500 text-[11px] font-sans leading-relaxed">
                    Edge routers deployed in US-East, EU-Central, and AP-East ensure low latency globally.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CORE PRINCIPLES */}
          {activeSection === 'principles' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OVERVIEW / PRINCIPLES</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Core Architecture Principles</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  The engineering tenets behind LiteDaemon's unified tool routing gateway.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Key className="w-5 h-5 text-lime-500" /> 1. Bring Your Own Keys (BYOK) Autonomy
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Never get locked into proprietary provider pricing. LiteDaemon lets you plug in direct API keys for Tavily, Firecrawl, Exa, Steel, and E2B with 0% gateway markup.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-cyan-500" /> 2. Unified Schema Standardization
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Write code once. Switch seamlessly between 36+ underlying search engines, scrapers, and execution sandboxes without rewriting payload schemas or parameter keys.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> 3. Instant Redundancy &amp; Auto-Failover
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    If an upstream provider encounters HTTP 429 rate limits or outage spikes, LiteDaemon automatically fails over to your secondary key or fallback provider adapter within milliseconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK FOR OTHER SECTIONS */}
          {activeSection !== 'quickstart' && activeSection !== 'architecture' && activeSection !== 'principles' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-4 font-mono text-xs">
              <span className="text-lime-500 font-bold uppercase tracking-wider text-[11px] block">DOCUMENTATION GUIDE</span>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-zinc-500 font-sans leading-relaxed">
                Detailed technical documentation, API specifications, and code samples for <strong>{activeSection}</strong>.
              </p>
              <Callout type="info" title="Vault & Key Configuration">
                Configure your provider keys in the <Link to="/vault" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">Key Vault</Link> or inspect your Master Key in <Link to="/settings" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">Settings</Link>.
              </Callout>
            </div>
          )}

        </main>

        {/* ── RIGHT TABLE OF CONTENTS (XL SCREENS ONLY) ───────────────────────── */}
        <aside className="w-56 shrink-0 hidden xl:block sticky top-24 font-mono text-xs space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            ON THIS PAGE:
          </span>

          <div className="space-y-2 text-zinc-500 border-l border-zinc-200 dark:border-zinc-800 pl-3">
            <a href="#overview" className="block hover:text-lime-500 transition-colors">Overview</a>
            <a href="#quickstart" className="block hover:text-lime-500 transition-colors">Quickstart</a>
            <a href="#authentication" className="block hover:text-lime-500 transition-colors">Authentication</a>
            <a href="#examples" className="block hover:text-lime-500 transition-colors">Code Examples</a>
          </div>
        </aside>

      </div>

    </div>
  );
};
