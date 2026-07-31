import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  Lock,
  ShieldCheck,
  Cpu,
  Layers,
  CreditCard,
  FileText,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Code2,
  Terminal,
  ArrowRight,
  Github,
  MessageSquare
} from 'lucide-react';

interface CodeSnippetProps {
  code: {
    python: string;
    typescript: string;
    curl: string;
  };
}

const CodeBlock: React.FC<CodeSnippetProps> = ({ code }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 overflow-hidden font-mono shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {(['python', 'typescript', 'curl'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-3 py-1 rounded-md transition-colors capitalize font-semibold ${
                activeTab === lang ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'cURL'}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <pre className="p-5 text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre font-mono">
        {code[activeTab]}
      </pre>
    </div>
  );
};

export const Docs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Active sub-doc resolution
  const activeDoc = path.includes('/architecture')
    ? 'architecture'
    : path.includes('/security')
    ? 'security'
    : path.includes('/failover')
    ? 'failover'
    : path.includes('/tools')
    ? 'tools'
    : path.includes('/frameworks')
    ? 'frameworks'
    : path.includes('/pricing-spec')
    ? 'pricing-spec'
    : 'quickstart';

  const sidebarSections = [
    {
      title: 'Overview',
      icon: Zap,
      items: [
        { label: 'Quickstart', path: '/docs/quickstart', id: 'quickstart' },
        { label: 'Gateway Architecture', path: '/docs/architecture', id: 'architecture' },
      ],
    },
    {
      title: 'Vault & Security',
      icon: Lock,
      items: [
        { label: 'Key Encryption & Storage', path: '/docs/security', id: 'security' },
        { label: 'Multi-Key Failover & Rate Limits', path: '/docs/failover', id: 'failover' },
      ],
    },
    {
      title: 'Supported Tools',
      icon: Layers,
      items: [
        { label: 'Tavily, Firecrawl, E2B & More', path: '/docs/tools', id: 'tools' },
      ],
    },
    {
      title: 'Framework SDKs',
      icon: Cpu,
      items: [
        { label: 'LangChain, CrewAI, AutoGen', path: '/docs/frameworks', id: 'frameworks' },
      ],
    },
    {
      title: 'Billing & Limits',
      icon: CreditCard,
      items: [
        { label: 'Free Tier & 5% Overage Spec', path: '/docs/pricing-spec', id: 'pricing-spec' },
      ],
    },
    {
      title: 'Legal & Compliance',
      icon: FileText,
      items: [
        { label: 'Privacy Policy', path: '/privacy', id: 'privacy' },
        { label: 'Terms of Service', path: '/terms', id: 'terms' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* ── Sticky Docs Top Header ────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white font-bold">Docs</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-emerald-400 font-semibold capitalize">{activeDoc}</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ALLFrontier-Labs/mvp"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://discord.gg/litedaemon"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Discord</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        
        {/* ── Fixed Left Sidebar Navigation ──────────────────────────────── */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/80 p-6 space-y-6 shrink-0 bg-[#09090b]">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase tracking-wider font-bold">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Documentation Portal</span>
          </div>

          <nav className="space-y-6 text-xs font-mono">
            {sidebarSections.map((sec) => (
              <div key={sec.title} className="space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1.5 font-sans">
                  <sec.icon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{sec.title}</span>
                </div>
                <div className="space-y-1 pl-2 border-l border-zinc-800">
                  {sec.items.map((item) => {
                    const isActive = activeDoc === item.id || path === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-2.5 py-1.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main Content Body ───────────────────────────────────────────── */}
        <main className="flex-1 p-6 md:p-12 max-w-4xl space-y-8 font-sans">

          {/* QUICKSTART DOC */}
          {activeDoc === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-xs mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  Quickstart Guide
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Getting Started with LiteDaemon Gateway
                </h1>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  Route Tavily, Firecrawl, Browserbase, and E2B requests using standard HTTP headers and a single master API key.
                </p>
              </div>

              {/* Tip Callout Box */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-white block mb-0.5">💡 OpenRouter Standard Compatibility</strong>
                  LiteDaemon uses standard OpenAI &amp; Tavily header formats. Drop in <code className="text-emerald-300 font-mono bg-zinc-900 px-1 py-0.5 rounded">https://gateway.litedaemon.com/v1</code> as your tool base URL without refactoring your codebase.
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">1. Obtain Your Master Key</h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Generate your master bearer token (<code className="text-emerald-400 font-mono">ld_live_...</code>) from your dashboard at <Link to="/keys" className="text-emerald-400 underline">/keys</Link>.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">2. Execute Your First BYOK Call</h2>
                <CodeBlock
                  code={{
                    python: `import requests

res = requests.post(
    "https://gateway.litedaemon.com/v1/search",
    headers={"Authorization": "Bearer ld_live_your_master_key"},
    json={"query": "Latest autonomous agent benchmark"}
)
print(res.json())`,
                    typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({ apiKey: 'ld_live_your_master_key' });
const result = await client.search({ query: 'Latest autonomous agent benchmark' });
console.log(result);`,
                    curl: `curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Latest autonomous agent benchmark"}'`,
                  }}
                />
              </div>

              {/* Warning Callout Box */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-white block mb-0.5">⚠️ Wallet Balance Note</strong>
                  After 1,000 free monthly requests, calls require a minimum $5 wallet balance for 5% overage routing fee processing.
                </div>
              </div>
            </div>
          )}

          {/* GATEWAY ARCHITECTURE DOC */}
          {activeDoc === 'architecture' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Gateway Architecture &amp; Ephemeral Proxying</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Learn how LiteDaemon forwards requests directly in-memory without persistent payload logging.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-4 text-xs text-zinc-300 leading-relaxed font-mono">
                <h3 className="text-white font-bold font-sans text-sm">Pass-Through Ephemeral Streaming</h3>
                <p>
                  Incoming HTTP payloads stream directly to target upstream provider REST APIs (Tavily, Firecrawl, Browserbase, E2B). Payload data never touches disk storage.
                </p>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400">
                  Client → LiteDaemon Gateway [AES-256 Key Decryption in RAM] → Upstream Provider → Return Response Stream
                </div>
              </div>
            </div>
          )}

          {/* SECURITY & VAULT DOC */}
          {activeDoc === 'security' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">AES-256 Vault Encryption Spec</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  How LiteDaemon protects user BYOK API credentials at rest.
                </p>
              </div>

              <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
                <p>
                  All provider API keys added to your LiteDaemon dashboard are encrypted using <strong>AES-256-GCM</strong> with user-isolated key derivation vectors. Plaintext keys are decrypted strictly inside isolated runtime memory during active proxy requests.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>SOC-2 ready zero-retention architecture ensures your private agent payloads remain completely confidential.</span>
              </div>
            </div>
          )}

          {/* FAILOVER & RATE LIMITS DOC */}
          {activeDoc === 'failover' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Multi-Key Failover &amp; Rate Limit Protection</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Zero 429 crashes for autonomous agent execution pipelines.
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                When an upstream provider returns a 429 rate limit or 401 quota error, LiteDaemon's auto-router catches the error and immediately rotates to your configured fallback BYOK key in 0ms.
              </p>
            </div>
          )}

          {/* TOOLS & PROVIDERS DOC */}
          {activeDoc === 'tools' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Supported Tool Providers</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Unified endpoints across 10+ major tool APIs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {[
                  { name: 'Firecrawl', cat: 'Scraping', endpoint: '/v1/scrape' },
                  { name: 'Tavily Search', cat: 'Search', endpoint: '/v1/search' },
                  { name: 'Browserbase', cat: 'Browser', endpoint: '/v1/browser' },
                  { name: 'E2B Sandbox', cat: 'Execute', endpoint: '/v1/execute' },
                  { name: 'LlamaParse', cat: 'Document', endpoint: '/v1/document' },
                  { name: 'Serper.dev', cat: 'Search', endpoint: '/v1/search' },
                ].map((t) => (
                  <div key={t.name} className="p-4 rounded-xl bg-[#0d0d0e] border border-zinc-800 space-y-1">
                    <span className="text-white font-bold block">{t.name}</span>
                    <span className="text-emerald-400 text-[11px]">{t.endpoint}</span>
                    <span className="text-zinc-500 text-[10px] block">{t.cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FRAMEWORKS DOC */}
          {activeDoc === 'frameworks' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Framework SDK Quickstarts</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Integrate with LangChain, CrewAI, AutoGen, Python, and TypeScript.
                </p>
              </div>

              <CodeBlock
                code={{
                  python: `# LangChain Integration
import os
from langchain_community.tools import TavilySearchResults

os.environ["TAVILY_API_BASE"] = "https://gateway.litedaemon.com/v1"
os.environ["TAVILY_API_KEY"]  = "ld_live_your_master_key"

tool = TavilySearchResults()
results = tool.invoke({"query": "Autonomous agent tool architectures"})`,
                  typescript: `// TypeScript Integration
import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({ apiKey: 'ld_live_your_master_key' });
const result = await client.scrape({ url: 'https://example.com' });`,
                  curl: `# CrewAI / Proxy Integration
export HTTP_PROXY="https://gateway.litedaemon.com/v1?key=ld_live_your_master_key"
export HTTPS_PROXY="https://gateway.litedaemon.com/v1?key=ld_live_your_master_key"`,
                }}
              />
            </div>
          )}

          {/* PRICING SPEC DOC */}
          {activeDoc === 'pricing-spec' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Free Tier &amp; 5% Fee Specification</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  OpenRouter-style BYOK gateway pricing model.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0d0d0e] border border-zinc-800 space-y-3 text-xs font-mono text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Monthly Base Fee</span>
                  <span className="text-emerald-400 font-bold">$0 / month</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Free Requests</span>
                  <span className="text-emerald-400 font-bold">1,000 requests/mo</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Reset Time</span>
                  <span>1st of every month at 00:00 UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Overage Routing Fee</span>
                  <span className="text-teal-400 font-bold">5% list-price fee (post 1k calls)</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
