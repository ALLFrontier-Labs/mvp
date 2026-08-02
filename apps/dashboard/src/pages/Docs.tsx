import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Copy, Check, ChevronRight, Github, MessageSquare,
  Zap, Lock, ShieldCheck, Layers, Cpu, CreditCard,
  FileText, Lightbulb, AlertTriangle, BookOpen,
  Terminal, ExternalLink, ArrowRight, Search,
  Rocket, Box, Code2, Book, ArrowDown, Server, Key, RefreshCw
} from 'lucide-react';
import { PROVIDER_META } from '../data/providers';
import { DocsFooter } from '../components/DocsFooter';

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
  | 'search'
  | 'scrape'
  | 'browser'
  | 'execute'
  | 'document'
  | 'errors'
  | 'sdks-hub'
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<DocTab>('docs');
  const [activeSection, setActiveSection] = useState<SectionId>('quickstart');

  // Synchronize active tab and section with URL route changes
  React.useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('api-reference') || path.includes('/v1/') || path.includes('/api')) {
      setActiveTab('api-reference');
      if (path.includes('search')) setActiveSection('search');
      else if (path.includes('scrape')) setActiveSection('scrape');
      else if (path.includes('browser')) setActiveSection('browser');
      else if (path.includes('execute')) setActiveSection('execute');
      else if (path.includes('document')) setActiveSection('document');
      else if (path.includes('errors')) setActiveSection('errors');
      else if (path.includes('tools')) setActiveSection('tools');
      else setActiveSection('api-ref');
    } else if (path.includes('sdks')) {
      setActiveTab('sdks');
      if (path.includes('python')) setActiveSection('sdk-python');
      else setActiveSection('sdk-ts');
    } else if (path.includes('langchain')) {
      setActiveTab('docs');
      setActiveSection('langchain');
    } else if (path.includes('crewai')) {
      setActiveTab('docs');
      setActiveSection('crewai');
    } else if (path.includes('autogen')) {
      setActiveTab('docs');
      setActiveSection('autogen');
    }
  }, [location.pathname]);

  const handleTabSelect = (tab: DocTab) => {
    setActiveTab(tab);
    if (tab === 'docs') {
      setActiveSection('quickstart');
      navigate('/docs');
    } else if (tab === 'api-reference') {
      setActiveSection('api-ref');
      navigate('/docs/api-reference');
    } else if (tab === 'sdks') {
      setActiveSection('sdks-hub');
      navigate('/docs/sdks');
    }
  };

  // Sidebar Menu Navigation Structure
  const ALL_NAVIGATION_GROUPS = [
    {
      group: 'OVERVIEW',
      tab: 'docs',
      items: [
        { id: 'quickstart', label: 'Quickstart Guide' },
        { id: 'architecture', label: 'System Architecture' },
        { id: 'principles', label: 'Core Principles' },
      ],
    },
    {
      group: 'AUTHENTICATION & KEYS',
      tab: 'docs',
      items: [
        { id: 'keys-vault', label: 'API Keys & Vault' },
        { id: 'key-encryption', label: 'Key Encryption' },
        { id: 'failover', label: 'Multi-Key Failover' },
      ],
    },
    {
      group: 'TOOL PROVIDERS & APIS',
      tab: 'api-reference',
      items: [
        { id: 'api-ref', label: 'API Reference Index' },
        { id: 'search', label: '/v1/search' },
        { id: 'scrape', label: '/v1/scrape' },
        { id: 'browser', label: '/v1/browser' },
        { id: 'execute', label: '/v1/execute' },
        { id: 'document', label: '/v1/document' },
        { id: 'errors', label: 'Error Dictionary' },
        { id: 'tools', label: 'Supported Providers (36+)' },
      ],
    },
    {
      group: 'OFFICIAL SDKS',
      tab: 'sdks',
      items: [
        { id: 'sdks-hub', label: 'SDKs Landing Hub' },
        { id: 'sdk-ts', label: 'TypeScript / Node.js' },
        { id: 'sdk-python', label: 'Python SDK' },
      ],
    },
    {
      group: 'FRAMEWORK INTEGRATIONS',
      tab: 'docs',
      items: [
        { id: 'langchain', label: 'LangChain' },
        { id: 'crewai', label: 'CrewAI' },
        { id: 'autogen', label: 'AutoGen' },
      ],
    },
  ];

  // Dynamically filter categories based on active tab
  const visibleGroups = ALL_NAVIGATION_GROUPS.filter(g => g.tab === activeTab);

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
                onClick={() => handleTabSelect(t)}
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
          {visibleGroups.map((group) => (
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

client = httpx.Client(base_url="https://litedaemon.xyz")
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
                    curl: `curl -X POST https://litedaemon.xyz/v1/search \\
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

          {/* SECTION 4: API KEYS & VAULT OVERVIEW */}
          {activeSection === 'keys-vault' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">AUTHENTICATION &amp; KEYS / OVERVIEW</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">API Keys &amp; Vault Architecture</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Understanding Master Gateway Keys versus Provider BYOK Keys.
                </p>
              </div>

              <Callout type="tip" title="Single Master Key Architecture">
                You never need to expose upstream provider keys in your client applications or server code—only pass your single Master Gateway Key (<code className="font-mono">ld_live_...</code>).
              </Callout>

              {/* Visual Flow Diagram */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 space-y-4 font-mono text-xs shadow-2xl">
                <span className="text-lime-400 font-bold uppercase tracking-wider block text-[11px]">
                  🔒 Key Separation &amp; Decryption Flow
                </span>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center pt-2">
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 w-full md:w-auto">
                    <span className="text-zinc-400 text-[10px] block">CLIENT SERVER</span>
                    <span className="font-bold text-white block">Bearer ld_live_...</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-lime-400 shrink-0 hidden md:block" />

                  <div className="p-3.5 rounded-2xl bg-lime-500/10 border border-lime-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-lime-400 text-[10px] block">LITEDAEMON</span>
                    <span className="font-bold text-lime-300 block">Unified Gateway</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-lime-400 shrink-0 hidden md:block" />

                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-purple-400 text-[10px] block">AES-256 VAULT</span>
                    <span className="font-bold text-purple-300 block">Ephemeral Decrypt</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-lime-400 shrink-0 hidden md:block" />

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 w-full md:w-auto">
                    <span className="text-emerald-400 text-[10px] block">UPSTREAM PROVIDER</span>
                    <span className="font-bold text-emerald-300 block">BYOK Key Executed</span>
                  </div>
                </div>
              </div>

              {/* Management Steps */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Key className="w-5 h-5 text-lime-500" /> Adding Keys to Vault (<Link to="/vault" className="text-lime-600 dark:text-lime-400 hover:underline">/vault</Link>)
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Navigate to <Link to="/vault" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">Key Vault</Link> to configure primary and secondary failover API keys for Tavily, Firecrawl, Exa, Steel, or E2B.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-500" /> Zero-Downtime Key Rotation
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Rotate provider keys seamlessly without changing client code. Simply add the new provider key to your vault and promote it to primary.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-500" /> Instant Revocation
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Deleting a key from your vault immediately revokes gateway routing permissions for that key across all edge nodes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: CRYPTOGRAPHIC SECURITY MODEL */}
          {activeSection === 'key-encryption' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">AUTHENTICATION &amp; KEYS / SECURITY</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Cryptographic Security Model</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  SHA-256 Master Key Hashing &amp; AES-256-GCM Client-Side Vault Encryption.
                </p>
              </div>

              {/* 5-Step Ephemeral Request Lifecycle Diagram */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 space-y-4 font-mono text-xs shadow-2xl">
                <span className="text-lime-400 font-bold uppercase tracking-wider block text-[11px]">
                  🛡️ 5-Step Ephemeral Request Lifecycle
                </span>

                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <span className="font-bold text-white block">Request Arrival</span>
                      <span className="text-zinc-400 text-[11px]">Client sends Authorization: Bearer ld_live_... header.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <span className="font-bold text-white block">SHA-256 Hash Lookup (&lt; 2ms)</span>
                      <span className="text-zinc-400 text-[11px]">Gateway matches SHA-256 hash of Master Key against database.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <span className="font-bold text-white block">AES-256 Vault Retrieval</span>
                      <span className="text-zinc-400 text-[11px]">Vault retrieves hardware-encrypted provider key blob.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <span className="font-bold text-white block">Ephemeral Memory Decryption</span>
                      <span className="text-zinc-400 text-[11px]">Key decrypted strictly in isolated RAM worker thread.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center shrink-0">5</span>
                    <div>
                      <span className="font-bold text-white block">Proxy Execution &amp; Memory Purge</span>
                      <span className="text-zinc-400 text-[11px]">Upstream call executed; plaintext key wiped from RAM immediately.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Policy Checklist Table */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-400 block text-[11px]">
                  Security Policy Standards Matrix:
                </span>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Data at Rest</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">AES-256-GCM Hardware Encrypted</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Data in Transit</td>
                        <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">TLS 1.3 Strict Enforced</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Key Logging Policy</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Zero-Plaintext Logging Guarantee</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Master Key Authentication</td>
                        <td className="p-3 text-lime-600 dark:text-lime-400 font-bold">SHA-256 One-Way Hash Lookup</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: MULTI-KEY FAILOVER ENGINE */}
          {activeSection === 'failover' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">AUTHENTICATION &amp; KEYS / FAILOVER</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Multi-Key Failover Routing</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Automatic provider rotation triggers and secondary fallback configuration.
                </p>
              </div>

              {/* Failover Trigger Matrix Table */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-400 block text-[11px]">
                  Failover Trigger Conditions Matrix:
                </span>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-bold text-[11px]">
                        <th className="p-3">UPSTREAM HTTP STATUS</th>
                        <th className="p-3">TRIGGER CAUSE</th>
                        <th className="p-3">GATEWAY ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tr>
                        <td className="p-3 text-amber-500 font-bold">HTTP 429</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">Rate Limit / Concurrency Exceeded</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">⚡ Instant Secondary Key Rotation</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 text-amber-500 font-bold">HTTP 402</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">Provider Quota Exhausted</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">⚡ Instant Secondary Key Rotation</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-rose-500 font-bold">HTTP 5xx</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">Upstream Server Outage</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">⚡ Auto-Retry &amp; Fallback Adapter</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 text-rose-500 font-bold">HTTP 401</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">Invalid / Revoked Provider Key</td>
                        <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">⚡ Alert Email &amp; Secondary Failover</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Code Snippet for Enforcing Failover */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  Enforcing Auto-Failover via Request Payload:
                </h3>
                <CodeBlock
                  filename="failover_config"
                  code={{
                    typescript: `const response = await fetch('https://litedaemon.xyz/v1/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ld_live_your_master_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Latest AI benchmarks 2026',
    provider: 'auto', // Enforces Primary -> Secondary Failover Chain
  }),
});`,
                    python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/search",
    headers={"Authorization": "Bearer ld_live_your_master_key"},
    json={"query": "Latest AI benchmarks 2026", "provider": "auto"}
)
print(response.json())`,
                    curl: `curl -X POST https://litedaemon.xyz/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Latest AI benchmarks 2026", "provider": "auto"}'`
                  }}
                />
              </div>
            </div>
          )}

          {/* SECTION 7: API REFERENCE LANDING HUB */}
          {activeSection === 'api-ref' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / HUB</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Unified API Reference</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Standardized HTTP REST endpoints for web scraping, neural search, cloud browsers, sandbox execution, and document parsing across 36+ underlying tool providers.
                </p>
              </div>

              {/* Base Gateway Card */}
              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 space-y-4 font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-lime-400 font-bold uppercase tracking-wider block text-[11px]">
                    🌐 Base Gateway Endpoint URL
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-lime-400/10 text-lime-400 border border-lime-400/20 text-[10px] font-bold">PRODUCTION EDGE ROUTER</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                  <code className="flex-1 text-xs text-lime-400 font-mono">https://litedaemon.xyz/v1</code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText('https://litedaemon.xyz/v1')}
                    className="px-3 py-1.5 rounded-lg bg-lime-400 text-zinc-950 font-bold text-[11px] hover:bg-lime-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Base URL</span>
                  </button>
                </div>
              </div>

              {/* Required Headers Table */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-400 block text-[11px]">
                  Required HTTP Headers:
                </span>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-bold text-[11px]">
                        <th className="p-3">HEADER KEY</th>
                        <th className="p-3">VALUE / PATTERN</th>
                        <th className="p-3">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tr>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Authorization</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Bearer ld_live_...</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Master Gateway Bearer token</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Content-Type</td>
                        <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">application/json</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">JSON request payload format</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">X-Provider-Override</td>
                        <td className="p-3 text-purple-600 dark:text-purple-400 font-bold">tavily | firecrawl | auto</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Optional upstream adapter override</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Endpoint Grid */}
              <div className="space-y-4">
                <span className="font-mono font-bold uppercase tracking-wider text-zinc-400 block text-xs">
                  Unified Core API Endpoints:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: /v1/search */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">POST /v1/search</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Search Proxy</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>🔍 Search &amp; Neural Retrieval</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        Unified web search proxy across Tavily, Exa, Serper, and Google Custom Search.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                        {['Tavily', 'Exa', 'Serper', 'Brave'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('search')}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Endpoint Docs →</span>
                    </button>
                  </div>

                  {/* Card 2: /v1/scrape */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">POST /v1/scrape</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Web Scraper</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>🌐 Web Scrape &amp; Markdown</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        Clean Markdown &amp; HTML extraction with automated anti-bot bypass and proxy rotation.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                        {['Firecrawl', 'Jina', 'Spider', 'Apify'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('scrape')}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Endpoint Docs →</span>
                    </button>
                  </div>

                  {/* Card 3: /v1/browser */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">POST /v1/browser</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Cloud Browser</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>🖥️ Headless Browser Sessions</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        Headless browser automation, Puppeteer WebSocket sessions, and screenshot capture.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                        {['Steel', 'Browserbase', 'Browserless'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('browser')}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Endpoint Docs →</span>
                    </button>
                  </div>

                  {/* Card 4: /v1/execute */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">POST /v1/execute</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Code Sandbox</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>⚡ Isolated Code Sandboxes</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        Isolated Python and JavaScript code sandbox execution environments.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                        {['E2B', 'Daytona', 'Modal'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('execute')}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Endpoint Docs →</span>
                    </button>
                  </div>

                  {/* Card 5: /v1/document */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all col-span-1 md:col-span-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">POST /v1/document</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Document Parser</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>📄 Document Parsing &amp; OCR</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        Convert PDF, DOCX, and scanned image documents into clean structured text and tables.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                        {['LlamaParse', 'Unstructured'].map(p => (
                          <span key={p} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('document')}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Endpoint Docs →</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Gateway Architecture Matrix */}
              <div className="space-y-3 font-mono text-xs pt-4">
                <span className="font-bold uppercase tracking-wider text-zinc-400 block text-[11px]">
                  Gateway Performance &amp; SLA Metrics:
                </span>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Gateway Rate Limit</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">600 req/min (Pro) • Custom (Enterprise)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Proxy Overhead Latency</td>
                        <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">~12ms Average Global Latency</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Status Codes</td>
                        <td className="p-3 text-lime-600 dark:text-lime-400 font-bold">200 (Success) • 401 (Auth) • 402 (Balance) • 429 (Rate) • 502 (Upstream)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 8: /v1/search ENDPOINT GUIDE */}
          {activeSection === 'search' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / SEARCH</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">POST /v1/search</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Unified web search and neural retrieval proxy across Tavily, Exa, Serper, Brave, and Perplexity.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-1">
                <span className="text-zinc-400 text-[10px] uppercase font-bold block">Supported Upstream Adapters:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Tavily', 'Exa', 'Serper', 'Brave Search', 'Google Custom', 'Perplexity'].map(p => (
                    <span key={p} className="px-2.5 py-1 rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20 font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <CodeBlock
                filename="search_request"
                code={{
                  curl: `curl -X POST https://litedaemon.xyz/v1/search \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "latest LLM reasoning benchmarks 2026", "max_results": 5, "search_depth": "advanced"}'`,
                  typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const daemon = new LiteDaemon({ apiKey: 'YOUR_LITEDAEMON_KEY' });
const response = await daemon.search({
  query: 'latest LLM reasoning benchmarks 2026',
  max_results: 5,
  search_depth: 'advanced'
});
console.log(response.results);`,
                  python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/search",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"query": "latest LLM reasoning benchmarks 2026", "max_results": 5}
)
print(response.json())`
                }}
              />
            </div>
          )}

          {/* SECTION 9: /v1/scrape ENDPOINT GUIDE */}
          {activeSection === 'scrape' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / SCRAPE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">POST /v1/scrape</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Web scraping, clean Markdown extraction, and anti-bot stealth proxy across Firecrawl, Jina, Apify, and Spider.
                </p>
              </div>

              <CodeBlock
                filename="scrape_request"
                code={{
                  curl: `curl -X POST https://litedaemon.xyz/v1/scrape \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://news.ycombinator.com", "formats": ["markdown"], "only_main_content": true}'`,
                  typescript: `const response = await fetch('https://litedaemon.xyz/v1/scrape', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_LITEDAEMON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://news.ycombinator.com',
    formats: ['markdown'],
    only_main_content: true
  })
});
const data = await response.json();`,
                  python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/scrape",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"url": "https://news.ycombinator.com", "formats": ["markdown"]}
)
print(response.json())`
                }}
              />
            </div>
          )}

          {/* SECTION 10: /v1/browser ENDPOINT GUIDE */}
          {activeSection === 'browser' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / BROWSER</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">POST /v1/browser</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Cloud headless Puppeteer/Playwright browser session automation across Steel Browser and Browserbase.
                </p>
              </div>

              <CodeBlock
                filename="browser_request"
                code={{
                  curl: `curl -X POST https://litedaemon.xyz/v1/browser \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"script": "await page.goto(\\"https://example.com\\");", "viewport": {"width": 1920, "height": 1080}}'`,
                  typescript: `const response = await fetch('https://litedaemon.xyz/v1/browser', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_LITEDAEMON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    script: 'await page.goto("https://example.com");',
    viewport: { width: 1920, height: 1080 }
  })
});`,
                  python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/browser",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"script": "await page.goto('https://example.com');"}
)
print(response.json())`
                }}
              />
            </div>
          )}

          {/* SECTION 11: /v1/execute ENDPOINT GUIDE */}
          {activeSection === 'execute' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / EXECUTE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">POST /v1/execute</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Isolated cloud code execution sandboxes across E2B Sandbox, Daytona, and Modal Labs.
                </p>
              </div>

              <CodeBlock
                filename="execute_request"
                code={{
                  python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/execute",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"language": "python", "code": "print('Hello from LiteDaemon Sandbox 2026!')", "timeout_seconds": 30}
)
print(response.json())`,
                  typescript: `const response = await fetch('https://litedaemon.xyz/v1/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_LITEDAEMON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    language: 'javascript',
    code: 'console.log("Hello from Sandbox!");',
    timeout_seconds: 30
  })
});`,
                  curl: `curl -X POST https://litedaemon.xyz/v1/execute \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"language": "python", "code": "print(\\"Hello from Sandbox!\\")"}'`
                }}
              />
            </div>
          )}

          {/* SECTION 12: /v1/document ENDPOINT GUIDE */}
          {activeSection === 'document' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / DOCUMENT</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">POST /v1/document</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  PDF, DOCX, and image OCR parsing engine across LlamaParse, Unstructured.io, and Firecrawl Parse.
                </p>
              </div>

              <CodeBlock
                filename="document_request"
                code={{
                  curl: `curl -X POST https://litedaemon.xyz/v1/document \\
  -H "Authorization: Bearer YOUR_LITEDAEMON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"document_url": "https://example.com/doc.pdf", "parsing_instruction": "Extract tabular financial metrics"}'`,
                  typescript: `const response = await fetch('https://litedaemon.xyz/v1/document', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_LITEDAEMON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    document_url: 'https://example.com/doc.pdf',
    parsing_instruction: 'Extract tabular financial metrics'
  })
});`,
                  python: `import httpx

client = httpx.Client(base_url="https://litedaemon.xyz")
response = client.post(
    "/v1/document",
    headers={"Authorization": "Bearer YOUR_LITEDAEMON_KEY"},
    json={"document_url": "https://example.com/doc.pdf"}
)
print(response.json())`
                }}
              />
            </div>
          )}

          {/* SECTION 13: GLOBAL ERROR DICTIONARY */}
          {activeSection === 'errors' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">API REFERENCE / ERRORS</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Global Error Dictionary</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Standardized HTTP status codes and gateway mitigation triggers.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-bold text-[11px]">
                        <th className="p-3">HTTP CODE</th>
                        <th className="p-3">NAME</th>
                        <th className="p-3">DESCRIPTION &amp; GATEWAY MITIGATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tr>
                        <td className="p-3 text-amber-500 font-bold">400</td>
                        <td className="p-3 text-zinc-900 dark:text-zinc-100 font-bold">Bad Request</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Invalid payload parameters or missing required query string.</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 text-rose-500 font-bold">401</td>
                        <td className="p-3 text-zinc-900 dark:text-zinc-100 font-bold">Unauthorized</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Missing or invalid Master Gateway Bearer token.</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-amber-500 font-bold">402</td>
                        <td className="p-3 text-zinc-900 dark:text-zinc-100 font-bold">Payment Required</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Insufficient prepaid routing wallet balance.</td>
                      </tr>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60">
                        <td className="p-3 text-cyan-500 font-bold">429</td>
                        <td className="p-3 text-zinc-900 dark:text-zinc-100 font-bold">Rate Limit Exceeded</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">⚡ Triggers automatic failover to secondary BYOK key.</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-purple-500 font-bold">502</td>
                        <td className="p-3 text-zinc-900 dark:text-zinc-100 font-bold">Upstream Provider Error</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">Upstream tool provider returned an error or timed out.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13.5: OFFICIAL SDKS LANDING HUB */}
          {activeSection === 'sdks-hub' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OFFICIAL SDKS / OVERVIEW</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Official Client SDKs &amp; Libraries</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Type-safe, production-ready client libraries for Node.js, TypeScript, Python, and REST direct integrations.
                </p>
              </div>

              {/* Language SDK Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card 1: TypeScript / Node.js SDK */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400 font-extrabold border border-lime-400/20">v1.4.0 • Stable</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">NPM PACKAGE</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>TypeScript / Node.js SDK</span>
                    </h3>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs flex items-center justify-between">
                      <code>npm install @litedaemon/sdk</code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('npm install @litedaemon/sdk')}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Copy command"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                      <span className="text-purple-400">import</span> &#123; LiteDaemon &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'@litedaemon/sdk'</span>;<br/>
                      <span className="text-blue-400">const</span> ld = <span className="text-blue-400">new</span> LiteDaemon();<br/>
                      <span className="text-blue-400">const</span> res = <span className="text-purple-400">await</span> ld.search(&#123; query: <span className="text-emerald-400">'AI agents 2026'</span> &#125;);
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('sdk-ts')}
                    className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-mono font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <span>View TypeScript SDK Docs →</span>
                  </button>
                </div>

                {/* Card 2: Python SDK */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400 font-extrabold border border-lime-400/20">v1.2.1 • Stable</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">PyPI PACKAGE</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Python SDK</span>
                    </h3>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs flex items-center justify-between">
                      <code>pip install litedaemon</code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('pip install litedaemon')}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Copy command"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                      <span className="text-purple-400">from</span> litedaemon <span className="text-purple-400">import</span> LiteDaemon<br/>
                      ld = LiteDaemon()<br/>
                      res = ld.scrape(url=<span className="text-emerald-400">"https://example.com"</span>, format=<span className="text-emerald-400">"markdown"</span>)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('sdk-python')}
                    className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-mono font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <span>View Python SDK Docs →</span>
                  </button>
                </div>

                {/* Card 3: AI Framework Adapters */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold border border-cyan-500/20">LangChain • CrewAI • AutoGen</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">FRAMEWORK WRAPPERS</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>🤖 AI Agent Framework Integration</span>
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                      Native tool wrappers to plug LiteDaemon unified BYOK proxy endpoints directly into your autonomous AI agent execution loops.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('langchain')}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Framework Guides →</span>
                  </button>
                </div>

                {/* Card 4: Direct REST / cURL */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-lime-400/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold border border-purple-500/20">HTTP / OpenAPI 3.0</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">DIRECT REST</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>🌐 Direct REST HTTP API</span>
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                      Zero-dependency HTTP integration via standard REST POST requests in Go, Rust, Java, C#, or bash cURL scripts.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('api-ref')}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View cURL Quickstart →</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 14: TYPESCRIPT / NODE.JS SDK GUIDE */}
          {activeSection === 'sdk-ts' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OFFICIAL SDKS / TYPESCRIPT</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">TypeScript / Node.js SDK</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Fully typed client library for Node.js, Next.js, and browser environments.
                </p>
              </div>

              {/* Environment Variable Setup Callout */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs space-y-1">
                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-wider block">Environment Setup:</span>
                <code className="text-emerald-400 text-xs block">export LITEDAEMON_API_KEY="ld_live_your_master_key"</code>
              </div>

              {/* Package Installation */}
              <div className="space-y-2 font-mono text-xs">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Package Installation:</span>
                <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-emerald-400">
                  npm install @litedaemon/sdk # or pnpm add @litedaemon/sdk
                </pre>
              </div>

              <CodeBlock
                filename="typescript_sdk_example"
                code={{
                  typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const daemon = new LiteDaemon({
  apiKey: process.env.LITEDAEMON_API_KEY
});

// Execute Unified Search across Tavily / Exa
const searchResults = await daemon.search({
  query: 'latest LLM reasoning benchmarks 2026',
  provider: 'auto',
  max_results: 5
});

// Execute Web Scrape & Markdown Extraction
const scrapeResults = await daemon.scrape({
  url: 'https://news.ycombinator.com',
  formats: ['markdown']
});

// Execute Python Code in Isolated Sandbox
const sandboxOutput = await daemon.execute({
  language: 'python',
  code: 'print("Hello from LiteDaemon Sandbox!")'
});`,
                  python: `# TypeScript SDK Usage (See Python tab for Python SDK)`,
                  curl: `# cURL Equivalent:
curl -X POST https://litedaemon.xyz/v1/search \\
  -H "Authorization: Bearer $LITEDAEMON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "latest LLM reasoning benchmarks 2026"}'`
                }}
              />
            </div>
          )}

          {/* SECTION 15: PYTHON SDK GUIDE */}
          {activeSection === 'sdk-python' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">OFFICIAL SDKS / PYTHON</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Python SDK</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Synchronous and asynchronous Python client with Pydantic model validation.
                </p>
              </div>

              {/* Environment Setup */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs space-y-1">
                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-wider block">Environment Setup:</span>
                <code className="text-emerald-400 text-xs block">export LITEDAEMON_API_KEY="ld_live_your_master_key"</code>
              </div>

              {/* Package Installation */}
              <div className="space-y-2 font-mono text-xs">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Package Installation:</span>
                <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-emerald-400">
                  pip install litedaemon
                </pre>
              </div>

              <CodeBlock
                filename="python_sdk_example"
                code={{
                  python: `import os
from litedaemon import LiteDaemon

ld = LiteDaemon(api_key=os.getenv("LITEDAEMON_API_KEY"))

# Synchronous Search Call
search_res = ld.search(
    query="AI agent benchmarks 2026",
    max_results=5,
    provider="auto"
)
print("Search Results:", search_res.results)

# Asynchronous Web Scrape
async def main():
    scrape_res = await ld.async_scrape(
        url="https://example.com",
        formats=["markdown"]
    )
    print("Markdown Content:", scrape_res.data.markdown)
`,
                  typescript: `// Python SDK Usage (See TypeScript tab for Node.js SDK)`,
                  curl: `# cURL Equivalent:
curl -X POST https://litedaemon.xyz/v1/search \\
  -H "Authorization: Bearer $LITEDAEMON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "AI agent benchmarks 2026"}'`
                }}
              />
            </div>
          )}

          {/* SECTION 16: LANGCHAIN INTEGRATION GUIDE */}
          {activeSection === 'langchain' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">FRAMEWORK INTEGRATIONS / LANGCHAIN</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">LangChain Integration</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Connect LiteDaemon unified proxy search and scrapers directly to LangChain AgentExecutor.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs space-y-1">
                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-wider block">Environment Setup:</span>
                <code className="text-emerald-400 text-xs block">export LITEDAEMON_API_KEY="ld_live_your_master_key"</code>
              </div>

              <CodeBlock
                filename="langchain_agent"
                code={{
                  python: `from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI
from litedaemon.langchain import LiteDaemonSearchTool, LiteDaemonScrapeTool

# Initialize LiteDaemon Tools with BYOK Routing
tools = [
    LiteDaemonSearchTool(api_key="ld_live_your_master_key"),
    LiteDaemonScrapeTool(api_key="ld_live_your_master_key"),
]

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

response = agent.run("Search for 2026 LLM benchmarks and extract key findings.")
print(response)`,
                  typescript: `import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { LiteDaemonSearchTool } from "@litedaemon/langchain";

const tools = [new LiteDaemonSearchTool({ apiKey: process.env.LITEDAEMON_API_KEY })];
const llm = new ChatOpenAI({ modelName: "gpt-4o" });

const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  agentType: "zero-shot-react-description",
});

const result = await executor.call({ input: "Search for 2026 AI agent tools" });
console.log(result.output);`,
                  curl: `# LangChain Runnable Example`
                }}
              />
            </div>
          )}

          {/* SECTION 17: CREWAI INTEGRATION GUIDE */}
          {activeSection === 'crewai' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">FRAMEWORK INTEGRATIONS / CREWAI</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">CrewAI Integration</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Empower multi-agent CrewAI teams with unified search, scraping, and code execution tools.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs space-y-1">
                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-wider block">Environment Setup:</span>
                <code className="text-emerald-400 text-xs block">export LITEDAEMON_API_KEY="ld_live_your_master_key"</code>
              </div>

              <CodeBlock
                filename="crewai_team"
                code={{
                  python: `from crewai import Agent, Task, Crew, Process
from litedaemon.crewai import LiteDaemonToolSet

# Initialize LiteDaemon ToolSet
tools = LiteDaemonToolSet(api_key="ld_live_your_master_key").get_tools()

# Define Senior Researcher Agent
researcher = Agent(
    role='Senior Market Analyst',
    goal='Gather live research using LiteDaemon BYOK unified proxy tools',
    backstory='Expert analyst leveraging multi-provider failover routing.',
    tools=tools,
    verbose=True
)

task = Task(
    description='Search for AI agent reasoning benchmarks and summarize trends.',
    expected_output='Brief bulleted report',
    agent=researcher
)

crew = Crew(agents=[researcher], tasks=[task], process=Process.sequential)
result = crew.kickoff()
print(result)`,
                  typescript: `// CrewAI Python Integration (See Python tab)`,
                  curl: `# CrewAI Runnable Example`
                }}
              />
            </div>
          )}

          {/* SECTION 18: AUTOGEN INTEGRATION GUIDE */}
          {activeSection === 'autogen' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">FRAMEWORK INTEGRATIONS / AUTOGEN</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">Microsoft AutoGen Integration</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  Function registration pattern for AutoGen ConversationalAgent sessions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs space-y-1">
                <span className="text-lime-400 text-[10px] font-bold uppercase tracking-wider block">Environment Setup:</span>
                <code className="text-emerald-400 text-xs block">export LITEDAEMON_API_KEY="ld_live_your_master_key"</code>
              </div>

              <CodeBlock
                filename="autogen_session"
                code={{
                  python: `import autogen
from litedaemon import LiteDaemon

ld = LiteDaemon()

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=2
)

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": [{"model": "gpt-4o"}]}
)

@user_proxy.register_for_execution()
@assistant.register_for_llm(description="Execute web search via LiteDaemon unified routing")
def web_search(query: str) -> dict:
    return ld.search(query=query, provider="auto")

# Initiate conversation
user_proxy.initiate_chat(
    assistant,
    message="Find the latest LLM reasoning benchmarks for 2026."
)`,
                  typescript: `// Microsoft AutoGen Python Integration (See Python tab)`,
                  curl: `# AutoGen Runnable Example`
                }}
              />
            </div>
          )}

          {/* FALLBACK FOR OTHER SECTIONS */}
          {activeSection !== 'quickstart' &&
           activeSection !== 'architecture' &&
           activeSection !== 'principles' &&
           activeSection !== 'keys-vault' &&
           activeSection !== 'key-encryption' &&
           activeSection !== 'failover' &&
           activeSection !== 'api-ref' &&
           activeSection !== 'search' &&
           activeSection !== 'scrape' &&
           activeSection !== 'browser' &&
           activeSection !== 'execute' &&
           activeSection !== 'document' &&
           activeSection !== 'errors' &&
           activeSection !== 'sdks-hub' &&
           activeSection !== 'sdk-ts' &&
           activeSection !== 'sdk-python' &&
           activeSection !== 'langchain' &&
           activeSection !== 'crewai' &&
           activeSection !== 'autogen' && (
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

          <DocsFooter />
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
