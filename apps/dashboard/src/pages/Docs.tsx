import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Copy, Check, ChevronRight, Github, MessageSquare,
  Zap, Lock, ShieldCheck, Layers, Cpu, CreditCard,
  FileText, Lightbulb, AlertTriangle, BookOpen,
  Terminal, ExternalLink, ArrowRight, Search,
  Rocket, Box, Code2, Book
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Lang = 'python' | 'typescript' | 'curl';
type DocTab = 'docs' | 'api-reference' | 'sdks';

/* ─── Code Block ─────────────────────────────────────────────────────────── */
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
    <div
      className="my-6 rounded-xl overflow-hidden text-xs font-mono shadow-xl"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          {filename && (
            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {filename}.{ext[lang]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language tabs */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            {(['python', 'typescript', 'curl'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2.5 py-1 rounded-md transition-all text-[10px] font-semibold cursor-pointer capitalize"
                style={
                  lang === l
                    ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {l === 'typescript' ? 'TypeScript' : l === 'python' ? 'Python' : 'cURL'}
              </button>
            ))}
          </div>

          {/* Copy */}
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-semibold"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: copied ? '#22c55e' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="flex overflow-x-auto p-4">
        {/* Line numbers */}
        <div
          className="select-none text-right pr-4 border-r mr-4 shrink-0 space-y-[1px] text-[11px] leading-relaxed"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        {/* Code lines */}
        <pre className="flex-1 text-[11px] leading-relaxed overflow-x-auto" style={{ color: 'var(--text-primary)' }}>
          {lines.map((line, i) => <div key={i} className="whitespace-pre">{line || ' '}</div>)}
        </pre>
      </div>
    </div>
  );
};

/* ─── Callout ────────────────────────────────────────────────────────────── */
const Callout: React.FC<{
  type: 'tip' | 'warning' | 'info' | 'danger';
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const styles = {
    tip:     { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.25)',  icon: '💡', color: '#86efac' },
    warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', icon: '⚠️', color: '#fcd34d' },
    info:    { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.25)', icon: 'ℹ️', color: '#a5b4fc' },
    danger:  { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.25)',  icon: '🚫', color: '#fca5a5' },
  };
  const s = styles[type];

  return (
    <div
      className="my-5 p-4 rounded-xl flex gap-3 text-xs leading-relaxed"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
      <div>
        {title && <strong className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>{title}</strong>}
        <div style={{ color: 'var(--text-secondary)' }}>{children}</div>
      </div>
    </div>
  );
};

/* ─── Inline Code ────────────────────────────────────────────────────────── */
const IC: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code
    className="text-[11px] font-mono px-1.5 py-0.5 rounded"
    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
  >
    {children}
  </code>
);

/* ─── Section Heading ────────────────────────────────────────────────────── */
const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
    {children}
  </h1>
);
const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold mt-10 mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
    {children}
  </h2>
);
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: 'var(--text-primary)' }}>
    {children}
  </h3>
);
const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={`text-sm leading-7 mb-4 ${className ?? ''}`} style={{ color: 'var(--text-secondary)' }}>
    {children}
  </p>
);

/* ─── Parameter Table ────────────────────────────────────────────────────── */
const ParamTable: React.FC<{
  params: { name: string; type: string; required?: boolean; default?: string; desc: string }[];
}> = ({ params }) => (
  <div className="my-4 rounded-xl border overflow-hidden text-xs" style={{ borderColor: 'var(--border)' }}>
    <div className="grid grid-cols-12 gap-2 px-4 py-2 font-semibold uppercase tracking-wider text-[11px] border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
      <span className="col-span-3">Parameter</span>
      <span className="col-span-2">Type</span>
      <span className="col-span-2">Default</span>
      <span className="col-span-5">Description</span>
    </div>
    {params.map((p, i) => (
      <div key={p.name} className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0 items-center" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)' }}>
        <span className="col-span-3 font-mono font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          {p.name}
          {p.required && <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">REQ</span>}
        </span>
        <span className="col-span-2 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.type}</span>
        <span className="col-span-2 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.default ?? '—'}</span>
        <span className="col-span-5" style={{ color: 'var(--text-secondary)' }}>{p.desc}</span>
      </div>
    ))}
  </div>
);

/* ─── Sidebar Nav Data ───────────────────────────────────────────────────── */
const SIDEBAR = [
  {
    title: 'Overview',
    icon: BookOpen,
    items: [
      { label: 'Quickstart',        id: 'quickstart',    icon: Rocket },
      { label: 'Architecture',      id: 'architecture',  icon: Layers },
      { label: 'Principles',        id: 'principles',    icon: Book },
    ],
  },
  {
    title: 'Authentication & Keys',
    icon: Lock,
    items: [
      { label: 'API Keys & Vault',  id: 'keys',          icon: Lock },
      { label: 'Key Encryption',    id: 'security',      icon: ShieldCheck },
      { label: 'Multi-Key Failover', id: 'failover',     icon: Zap },
    ],
  },
  {
    title: 'Tool Providers & APIs',
    icon: Layers,
    items: [
      { label: 'Supported Tools',   id: 'tools',         icon: Box },
      { label: 'API Reference',     id: 'endpoints',     icon: Code2 },
    ],
  },
  {
    title: 'Official SDKs',
    icon: Terminal,
    items: [
      { label: 'TypeScript / Node', id: 'sdk-npm',       icon: Terminal },
      { label: 'Python SDK',        id: 'sdk-python',    icon: Terminal },
    ],
  },
  {
    title: 'Framework Integrations',
    icon: Cpu,
    items: [
      { label: 'LangChain',         id: 'langchain',     icon: Terminal },
      { label: 'CrewAI',            id: 'crewai',        icon: Terminal },
      { label: 'AutoGen',           id: 'autogen',       icon: Terminal },
      { label: 'LlamaIndex',        id: 'llamaindex',    icon: Terminal },
      { label: 'n8n / Webhooks',    id: 'n8n',           icon: Terminal },
    ],
  },
  {
    title: 'Billing & Limits',
    icon: CreditCard,
    items: [
      { label: 'Pricing Model',     id: 'pricing',       icon: CreditCard },
      { label: 'Rate Limits',       id: 'rate-limits',   icon: AlertTriangle },
    ],
  },
  {
    title: 'Legal',
    icon: FileText,
    items: [
      { label: 'Privacy Policy',    id: 'privacy-link',  icon: FileText, href: '/privacy' },
      { label: 'Terms of Service',  id: 'terms-link',    icon: FileText, href: '/terms' },
    ],
  },
];

/* ─── Doc Content Map ────────────────────────────────────────────────────── */
const DOC_CONTENT: Record<string, React.ReactNode> = {

  /* ── QUICKSTART ──────────────────────────────────────────────────────── */
  quickstart: (
    <div className="space-y-2">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-4"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#86efac' }}
      >
        <Rocket className="w-3 h-3" /> Quickstart Guide
      </div>
      <H1>Get Started with LiteDaemon</H1>
      <P>
        Route Tavily, Firecrawl, Browserbase, E2B, Exa, Serper and more through a single master API key.
        No more juggling provider keys in your codebase.
      </P>

      <Callout type="tip" title="Drop-in Compatible">
        LiteDaemon uses standard HTTP <IC>Authorization: Bearer</IC> headers.
        Just swap the base URL — your existing code works immediately.
      </Callout>

      <H2>Step 1 — Create Your Account</H2>
      <P>
        Sign up at <Link to="/auth" className="underline" style={{ color: '#ccff00' }}>/auth</Link> and
        verify your email. You'll land in your personal workspace.
      </P>

      <H2>Step 2 — Add Your Provider Keys</H2>
      <P>
        Navigate to <Link to="/keys" className="underline" style={{ color: '#ccff00' }}>/keys</Link> and add
        your API keys for Tavily, Firecrawl, E2B, etc. All keys are encrypted at rest with AES-256-GCM.
      </P>

      <Callout type="info" title="BYOK Model">
        LiteDaemon is Bring-Your-Own-Key. We never store plaintext keys — they're encrypted in your vault and
        decrypted only in isolated runtime memory during active requests.
      </Callout>

      <H2>Step 3 — Get Your Master Key</H2>
      <P>
        Your master key (<IC>ld_live_...</IC>) is generated automatically. Copy it from the Keys page.
        This single key routes to all your vaulted provider keys.
      </P>

      <H2>Step 4 — Make Your First Request</H2>
      <CodeBlock
        filename="quickstart"
        code={{
          python: `import requests

res = requests.post(
    "https://gateway.litedaemon.com/v1/search",
    headers={
        "Authorization": "Bearer ld_live_your_master_key",
        "Content-Type": "application/json",
    },
    json={"query": "Latest LLM benchmark results 2025"}
)
print(res.json())`,
          typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({
  apiKey: 'ld_live_your_master_key',
});

const result = await client.search({
  query: 'Latest LLM benchmark results 2025',
});

console.log(result);`,
          curl: `curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Latest LLM benchmark results 2025"}'`,
        }}
      />

      <Callout type="warning" title="Free Tier Limits">
        The first <strong>1,000 requests/month</strong> are completely free. After that, a 5% routing fee
        applies per request. Top up at <Link to="/billing" className="underline" style={{ color: '#ccff00' }}>/billing</Link>.
      </Callout>

      <H2>Next Steps</H2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {[
          { label: 'Explore all supported tools →',   id: 'tools' },
          { label: 'Framework SDK guides →',           id: 'langchain' },
          { label: 'Understand key security →',        id: 'security' },
          { label: 'Pricing & rate limits →',          id: 'pricing' },
        ].map((c) => (
          <Link
            key={c.id}
            to={`/docs/${c.id}`}
            className="flex items-center justify-between p-4 rounded-xl text-sm transition-all group"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ccff00')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span>{c.label}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#ccff00' }} />
          </Link>
        ))}
      </div>
    </div>
  ),

  /* ── ARCHITECTURE ────────────────────────────────────────────────────── */
  architecture: (
    <div className="space-y-2">
      <H1>Gateway Architecture</H1>
      <P>Learn how LiteDaemon proxies your tool requests with zero payload persistence.</P>

      <H2>Ephemeral Pass-Through Proxying</H2>
      <P>
        Every request flows through LiteDaemon's gateway as an in-memory stream.
        Payload data <strong>never touches disk storage</strong>. AES-256-GCM encrypted keys are decrypted
        strictly inside isolated runtime memory during the lifespan of each request.
      </P>

      <div
        className="my-6 p-6 rounded-xl font-mono text-xs leading-loose text-center"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#86efac' }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Your Agent / App
            </span>
          </div>
          <div className="text-zinc-500 text-lg">↓ HTTPS + Bearer ld_live_...</div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1.5 rounded" style={{ backgroundColor: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.3)', color: '#ccff00' }}>
              LiteDaemon Gateway
            </span>
          </div>
          <div className="text-zinc-500 text-sm">↓ AES-256 decrypt key in RAM → upstream HTTP</div>
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {['Tavily', 'Firecrawl', 'E2B'].map(p => (
              <span key={p} className="px-2 py-1 rounded text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {p}
              </span>
            ))}
          </div>
          <div className="text-zinc-500 text-sm">↑ Stream response back → your agent</div>
        </div>
      </div>

      <Callout type="tip" title="Zero Payload Logging">
        LiteDaemon logs request metadata (timestamps, token counts, provider selected) but
        never logs request bodies or response payloads.
      </Callout>

      <H2>Request Lifecycle</H2>
      <ol className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {[
          'Incoming request arrives with master key header.',
          'Gateway validates master key against Postgres session table.',
          'Gateway selects the correct provider from vault using routing rules.',
          'AES-256-GCM decrypts the BYOK provider key in-memory.',
          'Upstream HTTP request is forwarded with decrypted key.',
          'Response streams back to caller. Decrypted key is zeroed from memory.',
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
              style={{ backgroundColor: 'rgba(204,255,0,0.1)', color: '#ccff00', border: '1px solid rgba(204,255,0,0.3)' }}
            >
              {i + 1}
            </span>
            <span className="leading-6">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  ),

  /* ── PRINCIPLES ─────────────────────────────────────────────────────── */
  principles: (
    <div className="space-y-2">
      <H1>Design Principles</H1>
      <P>The core design decisions behind the LiteDaemon gateway.</P>
      <H2>1. BYOK First</H2>
      <P>You own your API keys. LiteDaemon never charges provider-side fees — you pay the provider directly via your vaulted keys. We charge only a small 5% routing fee after 1,000 free requests.</P>
      <H2>2. Zero Persistence</H2>
      <P>Payloads are never stored. No prompt history. No tool call logs. Ephemeral proxying by design.</P>
      <H2>3. Drop-In Compatible</H2>
      <P>Standard Bearer token auth and REST endpoints. If you use Tavily, Firecrawl, or E2B today, you need only swap the base URL to <IC>https://gateway.litedaemon.com/v1</IC>.</P>
      <H2>4. Automatic Failover</H2>
      <P>Multiple BYOK keys per provider? LiteDaemon auto-rotates on 429 / 401 errors — your agents never crash from rate limits.</P>
    </div>
  ),

  /* ── KEYS ────────────────────────────────────────────────────────────── */
  keys: (
    <div className="space-y-2">
      <H1>API Keys & Vault</H1>
      <P>How to create, manage, and use LiteDaemon master keys alongside your BYOK provider vault.</P>

      <H2>Master Key Format</H2>
      <P>Your LiteDaemon master key follows the format:</P>
      <div className="my-4 p-4 rounded-xl font-mono text-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#86efac' }}>
        ld_live_&lt;base62-random-48chars&gt;
      </div>

      <H2>Adding Provider Keys to Vault</H2>
      <P>Navigate to <Link to="/keys" className="underline" style={{ color: '#ccff00' }}>/keys</Link> → click <strong>"Add Key"</strong> → select provider → paste your key. It is immediately encrypted and stored.</P>

      <Callout type="tip" title="Key Rotation">
        Add multiple keys per provider for automatic rate-limit failover. LiteDaemon round-robins across healthy keys automatically.
      </Callout>

      <H2>Using Your Master Key</H2>
      <CodeBlock
        filename="auth"
        code={{
          python: `import os

# Set your master key as an environment variable
os.environ["LITEDAEMON_API_KEY"] = "ld_live_your_master_key"

# Or pass directly in headers
headers = {
    "Authorization": f"Bearer {os.environ['LITEDAEMON_API_KEY']}"
}`,
          typescript: `// Recommended: use environment variables
const apiKey = process.env.LITEDAEMON_API_KEY!;

const res = await fetch('https://gateway.litedaemon.com/v1/search', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'AI agent tools 2025' }),
});`,
          curl: `# Export master key
export LITEDAEMON_API_KEY="ld_live_your_master_key"

curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer $LITEDAEMON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "AI agent tools"}'`,
        }}
      />
    </div>
  ),

  /* ── SECURITY ────────────────────────────────────────────────────────── */
  security: (
    <div className="space-y-2">
      <H1>Key Encryption & Storage</H1>
      <P>How LiteDaemon protects your BYOK API credentials at rest and in transit.</P>

      <H2>Encryption Specification</H2>
      <div className="my-5 space-y-2">
        {[
          ['Algorithm',  'AES-256-GCM'],
          ['Key Derivation', 'PBKDF2-SHA256, 310,000 iterations'],
          ['IV / Nonce',  '96-bit random per encryption'],
          ['Auth Tag',    '128-bit GCM authentication tag'],
          ['Storage',     'PostgreSQL encrypted column'],
          ['Memory',      'Decrypted only in RAM, zeroed post-request'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-xs"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>

      <Callout type="tip" title="SOC-2 Ready Architecture">
        Zero-retention design ensures your private agent payloads remain completely confidential.
        LiteDaemon never logs request bodies or tool call arguments.
      </Callout>
    </div>
  ),

  /* ── FAILOVER ────────────────────────────────────────────────────────── */
  failover: (
    <div className="space-y-2">
      <H1>Multi-Key Failover & Rate Limit Protection</H1>
      <P>Zero 429 crashes for autonomous agent execution pipelines.</P>

      <H2>How Failover Works</H2>
      <P>
        When an upstream provider returns <IC>429 Too Many Requests</IC> or <IC>401 Quota Exceeded</IC>,
        LiteDaemon's auto-router immediately rotates to the next healthy BYOK key in your pool.
        This happens in the same request — your caller receives the successful response.
      </P>

      <H2>Failover Decision Tree</H2>
      <div className="my-5 p-5 rounded-xl font-mono text-xs leading-loose" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <div>Upstream returns 429 or 401</div>
        <div className="ml-4 text-zinc-500">↓</div>
        <div className="ml-4">Are there backup keys for this provider?</div>
        <div className="ml-8 text-zinc-500">├── Yes → retry with next key (same request)</div>
        <div className="ml-8 text-zinc-500">└── No  → return 429 with <IC>X-LD-Retry-After</IC> header</div>
      </div>

      <Callout type="tip" title="Best Practice">
        Add at least 2 keys per provider in your vault. LiteDaemon will automatically round-robin
        across healthy keys even without rate limit errors, distributing load evenly.
      </Callout>
    </div>
  ),

  /* ── TOOLS ───────────────────────────────────────────────────────────── */
  tools: (
    <div className="space-y-2">
      <H1>Supported Tool Providers</H1>
      <P>LiteDaemon routes to 10+ major AI agent tool APIs through a unified endpoint.</P>

      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { name: 'Tavily Search',   cat: 'Web Search',    endpoint: '/v1/search',    status: 'stable',  color: '#818cf8' },
          { name: 'Exa Search',      cat: 'Web Search',    endpoint: '/v1/exa/search',status: 'stable',  color: '#34d399' },
          { name: 'Serper.dev',      cat: 'Google Search', endpoint: '/v1/serper',    status: 'stable',  color: '#22d3ee' },
          { name: 'Firecrawl',       cat: 'Web Scraping',  endpoint: '/v1/scrape',    status: 'stable',  color: '#f97316' },
          { name: 'Jina Reader',     cat: 'Web Scraping',  endpoint: '/v1/jina',      status: 'stable',  color: '#e879f9' },
          { name: 'Spider',          cat: 'Web Scraping',  endpoint: '/v1/spider',    status: 'stable',  color: '#a78bfa' },
          { name: 'E2B Sandbox',     cat: 'Code Execution',endpoint: '/v1/execute',   status: 'stable',  color: '#fbbf24' },
          { name: 'Browserbase',     cat: 'Browser',       endpoint: '/v1/browser',   status: 'stable',  color: '#c084fc' },
          { name: 'Steel Browser',   cat: 'Browser',       endpoint: '/v1/steel',     status: 'beta',    color: '#67e8f9' },
          { name: 'LlamaParse',      cat: 'Document',      endpoint: '/v1/document',  status: 'stable',  color: '#fb923c' },
        ].map((t) => (
          <div
            key={t.name}
            className="p-4 rounded-xl text-xs transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                style={{
                  backgroundColor: t.status === 'stable' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  color: t.status === 'stable' ? '#4ade80' : '#fbbf24',
                  border: `1px solid ${t.status === 'stable' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}
              >
                {t.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>{t.cat}</span>
              <IC>{t.endpoint}</IC>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  /* ── ENDPOINTS ───────────────────────────────────────────────────────── */
  endpoints: (
    <div className="space-y-6">
      <div>
        <H1>API Reference & Gateway Endpoints</H1>
        <P>Complete reference for LiteDaemon REST endpoints. All requests require header authentication: <IC>Authorization: Bearer ld_live_...</IC></P>
      </div>

      {/* 1. SEARCH */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">POST</span>
          <span className="font-mono text-base font-bold" style={{ color: 'var(--text-primary)' }}>/v1/search</span>
        </div>
        <P>Route unified web search queries across Tavily, Exa, or Serper based on active vault credentials.</P>

        <H3>Request Parameters</H3>
        <ParamTable params={[
          { name: 'query', type: 'string', required: true, desc: 'Search query keyword or question.' },
          { name: 'provider', type: 'string', required: false, default: 'auto', desc: 'Target engine: "tavily" | "exa" | "serper" | "auto"' },
          { name: 'num_results', type: 'number', required: false, default: '10', desc: 'Number of search result objects to return (1-50).' },
          { name: 'search_depth', type: 'string', required: false, default: 'basic', desc: '"basic" (faster) or "advanced" (deep content extraction).' },
          { name: 'include_domains', type: 'string[]', required: false, desc: 'Limit search strictly to specific domain hostnames.' },
        ]} />

        <H3>Code Example</H3>
        <CodeBlock filename="search" code={{
          python: `import requests

res = requests.post(
    "https://gateway.litedaemon.com/v1/search",
    headers={"Authorization": "Bearer ld_live_master"},
    json={
        "query": "Autonomous AI Agent Benchmarks 2025",
        "provider": "tavily",
        "num_results": 5
    }
)
print(res.json())`,
          typescript: `const res = await fetch('https://gateway.litedaemon.com/v1/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ld_live_master',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Autonomous AI Agent Benchmarks 2025',
    provider: 'tavily',
    num_results: 5
  })
});
const data = await res.json();`,
          curl: `curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_master" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"Autonomous AI Agent Benchmarks 2025","provider":"tavily"}'`,
        }} />
      </div>

      {/* 2. SCRAPE */}
      <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">POST</span>
          <span className="font-mono text-base font-bold" style={{ color: 'var(--text-primary)' }}>/v1/scrape</span>
        </div>
        <P>Scrape and convert any webpage URL to clean Markdown, HTML, or raw text using Firecrawl, Jina, or Spider.</P>

        <H3>Request Parameters</H3>
        <ParamTable params={[
          { name: 'url', type: 'string', required: true, desc: 'Target HTTP/HTTPS URL to scrape.' },
          { name: 'provider', type: 'string', required: false, default: 'firecrawl', desc: 'Engine: "firecrawl" | "jina" | "spider"' },
          { name: 'formats', type: 'string[]', required: false, default: '["markdown"]', desc: 'Output formats: ["markdown", "html", "rawHtml"]' },
          { name: 'wait_for', type: 'number', required: false, default: '0', desc: 'Milliseconds to wait before capturing DOM.' },
        ]} />

        <CodeBlock filename="scrape" code={{
          python: `res = requests.post(
    "https://gateway.litedaemon.com/v1/scrape",
    headers={"Authorization": "Bearer ld_live_master"},
    json={"url": "https://news.ycombinator.com", "provider": "firecrawl"}
)`,
          typescript: `const res = await fetch('https://gateway.litedaemon.com/v1/scrape', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ld_live_master', 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://news.ycombinator.com', provider: 'firecrawl' })
});`,
          curl: `curl -X POST https://gateway.litedaemon.com/v1/scrape \\
  -H "Authorization: Bearer ld_live_master" \\
  -d '{"url":"https://news.ycombinator.com","provider":"firecrawl"}'`,
        }} />
      </div>

      {/* 3. EXECUTE */}
      <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">POST</span>
          <span className="font-mono text-base font-bold" style={{ color: 'var(--text-primary)' }}>/v1/execute</span>
        </div>
        <P>Execute code in isolated, microVM sandboxes via E2B or Modal.</P>

        <H3>Request Parameters</H3>
        <ParamTable params={[
          { name: 'code', type: 'string', required: true, desc: 'Source code snippet to execute.' },
          { name: 'language', type: 'string', required: false, default: 'python', desc: 'Runtime: "python" | "typescript" | "bash"' },
          { name: 'timeout_seconds', type: 'number', required: false, default: '30', desc: 'Max execution duration before kill.' },
        ]} />

        <CodeBlock filename="execute" code={{
          python: `res = requests.post(
    "https://gateway.litedaemon.com/v1/execute",
    headers={"Authorization": "Bearer ld_live_master"},
    json={"code": "import math; print(math.factorial(10))", "language": "python"}
)`,
          typescript: `const res = await fetch('https://gateway.litedaemon.com/v1/execute', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ld_live_master', 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'console.log("Hello from E2B Sandbox!")', language: 'typescript' })
});`,
          curl: `curl -X POST https://gateway.litedaemon.com/v1/execute \\
  -H "Authorization: Bearer ld_live_master" \\
  -d '{"code":"print(42)","language":"python"}'`,
        }} />
      </div>
    </div>
  ),

  /* ── OFFICIAL SDKS ────────────────────────────────────────────────────── */
  'sdk-npm': (
    <div className="space-y-4">
      <H1>TypeScript / Node.js SDK (`@litedaemon/sdk`)</H1>
      <P>Official TypeScript client for LiteDaemon. Full type safety for all 150+ tool engines.</P>

      <H2>Installation</H2>
      <CodeBlock filename="install" code={{
        python: `# Use npm, pnpm, or yarn
npm install @litedaemon/sdk`,
        typescript: `npm install @litedaemon/sdk`,
        curl: `npm install @litedaemon/sdk`,
      }} />

      <H2>Usage Example</H2>
      <CodeBlock filename="sdk_example" code={{
        python: `# TypeScript SDK Usage
import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({ apiKey: process.env.LITEDAEMON_API_KEY });
const result = await client.search({ query: 'Agentic Workflows 2025' });
console.log(result);`,
        typescript: `import { LiteDaemon } from '@litedaemon/sdk';

const client = new LiteDaemon({
  apiKey: process.env.LITEDAEMON_API_KEY,
  maxRetries: 3,
  timeoutMs: 15000,
});

// Search
const searchRes = await client.search({
  query: 'Latest LLM research papers',
  provider: 'tavily',
  numResults: 5,
});

// Scrape
const scrapeRes = await client.scrape({
  url: 'https://arxiv.org',
  provider: 'firecrawl',
});

console.log(searchRes, scrapeRes);`,
        curl: `curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer $LITEDAEMON_API_KEY" \\
  -d '{"query":"Agentic Workflows 2025"}'`,
      }} />
    </div>
  ),

  'sdk-python': (
    <div className="space-y-4">
      <H1>Python SDK (`litedaemon`)</H1>
      <P>Official Python client for LiteDaemon with async support and automatic failover retries.</P>

      <H2>Installation</H2>
      <CodeBlock filename="install_python" code={{
        python: `pip install litedaemon`,
        typescript: `pip install litedaemon`,
        curl: `pip install litedaemon`,
      }} />

      <H2>Usage Example</H2>
      <CodeBlock filename="python_usage" code={{
        python: `from litedaemon import LiteDaemon
import os

client = LiteDaemon(api_key=os.environ["LITEDAEMON_API_KEY"])

# Web Search
res = client.search(query="Python 3.13 features", provider="exa", num_results=5)
print(res.results)

# Execute Code in Sandbox
exec_res = client.execute(code="print('Hello from E2B')", language="python")
print(exec_res.output)`,
        typescript: `# Async Client also available
from litedaemon import AsyncLiteDaemon

async_client = AsyncLiteDaemon()
res = await async_client.search(query="Python 3.13 features")`,
        curl: `curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer $LITEDAEMON_API_KEY" \\
  -d '{"query":"Python 3.13 features"}'`,
      }} />
    </div>
  ),

  llamaindex: (
    <div className="space-y-4">
      <H1>LlamaIndex Integration</H1>
      <P>Use LiteDaemon as a tool spec for LlamaIndex RAG pipelines and agents.</P>
      <CodeBlock filename="llamaindex_quickstart" code={{
        python: `from llama_index.core.agent import ReActAgent
from llama_index.tools.tavily_research import TavilyToolSpec
import os

# Point Tavily spec to LiteDaemon Gateway
os.environ["TAVILY_API_BASE"] = "https://gateway.litedaemon.com/v1"
os.environ["TAVILY_API_KEY"] = "ld_live_your_master_key"

tavily_tool = TavilyToolSpec().to_tool_list()
agent = ReActAgent.from_tools(tavily_tool, verbose=True)

response = agent.chat("What are the latest AI agent trends in 2025?")
print(response)`,
        typescript: `import { ReActAgent } from 'llamaindex';
// Configure tool spec base URL to https://gateway.litedaemon.com/v1`,
        curl: `curl https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -d '{"query":"LlamaIndex AI Trends"}'`,
      }} />
    </div>
  ),

  /* ── LANGCHAIN ───────────────────────────────────────────────────────── */
  langchain: (
    <div className="space-y-2">
      <H1>LangChain Integration</H1>
      <P>Use LiteDaemon as the base URL for any LangChain community tool.</P>
      <CodeBlock filename="langchain_quickstart" code={{
        python: `import os
from langchain_community.tools import TavilySearchResults

# Point tool calls to LiteDaemon gateway
os.environ["TAVILY_API_BASE"] = "https://gateway.litedaemon.com/v1"
os.environ["TAVILY_API_KEY"]  = "ld_live_your_master_key"

tool = TavilySearchResults(max_results=5)
results = tool.invoke({"query": "Autonomous agent architectures 2025"})
print(results)`,
        typescript: `import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

// Override base URL to LiteDaemon
const tool = new TavilySearchResults({
  apiKey: 'ld_live_your_master_key',
  kwargs: { baseUrl: 'https://gateway.litedaemon.com/v1' },
  maxResults: 5,
});

const results = await tool.invoke('Autonomous agent architectures 2025');`,
        curl: `# No LangChain needed — raw REST also works
curl -X POST https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -d '{"query":"Autonomous agent architectures 2025","provider":"tavily"}'`,
      }} />
      <Callout type="tip">Works with LangGraph agents too — just set the tool's <IC>base_url</IC> attribute.</Callout>
    </div>
  ),

  /* ── CREWAI ──────────────────────────────────────────────────────────── */
  crewai: (
    <div className="space-y-2">
      <H1>CrewAI Integration</H1>
      <P>Route all CrewAI tool HTTP requests through LiteDaemon via proxy env vars.</P>
      <CodeBlock filename="crewai_quickstart" code={{
        python: `import os
from crewai import Agent, Task, Crew
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

# Point all outbound tool HTTP through LiteDaemon
os.environ["HTTP_PROXY"]  = "https://gateway.litedaemon.com/v1?key=ld_live_master"
os.environ["HTTPS_PROXY"] = "https://gateway.litedaemon.com/v1?key=ld_live_master"

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find the latest AI agent research",
    tools=[SerperDevTool(), ScrapeWebsiteTool()]
)
task = Task(description="Research autonomous AI agents in 2025", agent=researcher)
crew = Crew(agents=[researcher], tasks=[task])
crew.kickoff()`,
        typescript: `// CrewAI TypeScript — set axios base URL
import axios from 'axios';
axios.defaults.baseURL = 'https://gateway.litedaemon.com/v1';
axios.defaults.headers.common['Authorization'] = 'Bearer ld_live_your_master_key';`,
        curl: `# Test your connection
curl https://gateway.litedaemon.com/v1/health \\
  -H "Authorization: Bearer ld_live_your_master_key"`,
      }} />
    </div>
  ),

  /* ── AUTOGEN ─────────────────────────────────────────────────────────── */
  autogen: (
    <div className="space-y-2">
      <H1>AutoGen Integration</H1>
      <P>Configure AutoGen agents to use LiteDaemon for all tool execution.</P>
      <CodeBlock filename="autogen_quickstart" code={{
        python: `from autogen import AssistantAgent, UserProxyAgent

tool_config = {
    "base_url": "https://gateway.litedaemon.com/v1",
    "api_key": "ld_live_your_master_key",
}

assistant = AssistantAgent(
    name="research_assistant",
    llm_config={"config_list": [tool_config]},
)

user = UserProxyAgent(name="user", human_input_mode="NEVER")
user.initiate_chat(assistant, message="Search for the latest AI news")`,
        typescript: `import { AssistantAgent } from 'autogen-core';

const assistant = new AssistantAgent({
  name: 'research_assistant',
  toolConfig: {
    baseUrl: 'https://gateway.litedaemon.com/v1',
    apiKey: 'ld_live_your_master_key',
  },
});`,
        curl: `curl https://gateway.litedaemon.com/v1/search \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -d '{"query":"Latest AI news"}'`,
      }} />
    </div>
  ),

  /* ── N8N ─────────────────────────────────────────────────────────────── */
  n8n: (
    <div className="space-y-2">
      <H1>n8n / Webhook Integration</H1>
      <P>Use LiteDaemon in any no-code or webhook-based automation tool.</P>
      <CodeBlock filename="n8n_node" code={{
        python: `# In Python — treat it as a standard REST API
import requests

res = requests.post(
    "https://gateway.litedaemon.com/v1/scrape",
    headers={"Authorization": "Bearer ld_live_your_master_key"},
    json={"url": "https://news.ycombinator.com"}
)`,
        typescript: `// n8n HTTP Request Node settings:
{
  "method": "POST",
  "url": "https://gateway.litedaemon.com/v1/scrape",
  "authentication": "headerAuth",
  "headers": {
    "Authorization": "Bearer ld_live_your_master_key",
    "Content-Type": "application/json"
  },
  "body": {
    "url": "https://news.ycombinator.com"
  }
}`,
        curl: `curl -X POST https://gateway.litedaemon.com/v1/scrape \\
  -H "Authorization: Bearer ld_live_your_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://news.ycombinator.com"}'`,
      }} />
      <Callout type="info">Works with Make (Integromat), Zapier, and any tool supporting HTTP requests.</Callout>
    </div>
  ),

  /* ── PRICING ─────────────────────────────────────────────────────────── */
  pricing: (
    <div className="space-y-2">
      <H1>Pricing Model</H1>
      <P>LiteDaemon charges zero monthly subscription. You pay a tiny routing fee after your free allowance.</P>

      <div className="my-6 space-y-2">
        {[
          { label: 'Monthly Base Fee',     value: '$0 / month',           highlight: true },
          { label: 'Free Requests',        value: '1,000 requests/month', highlight: true },
          { label: 'Free Period Reset',    value: '1st of each month, 00:00 UTC' },
          { label: 'Overage Routing Fee',  value: '5% of provider list price' },
          { label: 'Minimum Top-Up',       value: '$5.00 USD' },
          { label: 'Billing Method',       value: 'Prepaid wallet balance' },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-xs"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span
              className="font-mono font-semibold"
              style={{ color: highlight ? '#4ade80' : 'var(--text-primary)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <Callout type="tip" title="Example Cost">
        If you make 5,000 Tavily searches in a month and Tavily charges $0.01/search,
        LiteDaemon's fee = 4,000 × $0.01 × 5% = <strong>$2.00</strong> total routing fee.
      </Callout>

      <H2>Wallet Balance</H2>
      <P>Top up your wallet at <Link to="/billing" className="underline" style={{ color: '#ccff00' }}>/billing</Link>.
        Minimum deposit is $5. Fees are deducted per request after the 1,000 free requests.</P>
    </div>
  ),

  /* ── RATE LIMITS ─────────────────────────────────────────────────────── */
  'rate-limits': (
    <div className="space-y-2">
      <H1>Rate Limits</H1>
      <P>LiteDaemon gateway-level rate limits and how to handle them.</P>
      <div className="my-5 space-y-2">
        {[
          { label: 'Gateway requests/second (per key)',  value: '100 req/s' },
          { label: 'Gateway requests/minute (per key)', value: '2,000 req/min' },
          { label: 'Concurrent connections',            value: '50' },
          { label: 'Max payload size',                  value: '10 MB' },
          { label: 'Request timeout',                   value: '60 seconds' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-xs"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
      <Callout type="info">
        Upstream provider rate limits are separate. LiteDaemon auto-rotates BYOK keys to avoid upstream 429s.
      </Callout>
    </div>
  ),
};

/* ─── Main Docs Component ────────────────────────────────────────────────── */
export const Docs: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [search, setSearch]     = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  // Active doc from URL
  const pathSeg   = location.pathname.replace('/docs', '').replace(/^\//, '') || 'quickstart';
  const activeDoc = pathSeg || 'quickstart';

  let docTab: DocTab = 'docs';
  if (['quickstart', 'architecture', 'principles', 'keys', 'security', 'failover'].includes(activeDoc)) docTab = 'docs';
  if (['tools', 'endpoints'].includes(activeDoc)) docTab = 'api-reference';
  if (['langchain', 'crewai', 'autogen', 'n8n'].includes(activeDoc)) docTab = 'sdks';

  const DOC_TABS: { id: DocTab; label: string; icon: React.ReactNode; path: string }[] = [
    { id: 'docs',          label: 'Docs',          icon: <BookOpen className="w-3.5 h-3.5" />, path: '/docs/quickstart' },
    { id: 'api-reference', label: 'API Reference',  icon: <Code2 className="w-3.5 h-3.5" />, path: '/docs/endpoints' },
    { id: 'sdks',          label: 'SDKs',           icon: <Box className="w-3.5 h-3.5" />, path: '/docs/langchain' },
  ];

  const content = DOC_CONTENT[activeDoc] ?? DOC_CONTENT['quickstart'];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ── Docs Sub-Header ─────────────────────────────────────────────── */}
      <div
        className="sticky top-14 z-30 border-b"
        style={{ backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex items-center justify-between h-10">
            {/* Section tabs */}
            <div className="flex items-center">
              {DOC_TABS.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="flex items-center gap-1.5 px-4 h-10 text-xs font-medium relative transition-colors cursor-pointer"
                  style={{
                    color: docTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: docTab === tab.id ? 600 : 400,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {docTab === tab.id && (
                    <span
                      className="absolute bottom-0 left-0 w-full h-[2px]"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right: GitHub + Discord */}
            <div className="flex items-center gap-4 text-xs">
              <a
                href="https://github.com/ALLFrontier-Labs/mvp"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://discord.gg/litedaemon"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Discord</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Content ──────────────────────────────────────── */}
      <div className="max-w-8xl mx-auto flex">

        {/* ── Left Sidebar ────────────────────────────────────────────── */}
        <aside
          className="hidden lg:block w-72 shrink-0 sticky self-start overflow-y-auto"
          style={{
            top: '104px', // header (56px) + sub-header (48px)
            height: 'calc(100vh - 104px)',
            borderRight: '1px solid var(--border)',
            paddingBottom: '2.5rem',
          }}
        >
          {/* Search */}
          <div className="px-6 py-4">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-text"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent flex-1 outline-none text-xs"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Nav sections */}
          <nav className="px-4 pb-8 space-y-6">
            {SIDEBAR.map((section) => (
              <div key={section.title}>
                <div
                  className="flex items-center gap-2 px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <section.icon className="w-3 h-3" />
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items
                    .filter(item => !search || item.label.toLowerCase().includes(search.toLowerCase()))
                    .map((item) => {
                    const isActive = activeDoc === item.id;
                    if ('href' in item) {
                      return (
                        <Link
                          key={item.id}
                          to={(item as any).href}
                          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          {item.label}
                          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                        </Link>
                      );
                    }
                    return (
                      <Link
                        key={item.id}
                        to={`/docs/${item.id}`}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={
                          isActive
                            ? {
                                backgroundColor: 'rgba(204,255,0,0.08)',
                                color: '#ccff00',
                                fontWeight: 600,
                                border: '1px solid rgba(204,255,0,0.15)',
                              }
                            : {
                                color: 'var(--text-muted)',
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 md:px-12 py-10 max-w-3xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono mb-8" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/docs" className="hover:underline">Docs</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--text-primary)' }}>{activeDoc}</span>
          </div>

          {/* Page body */}
          <div className="prose-sm max-w-none">
            {content}
          </div>

          {/* Prev / Next */}
          <div
            className="mt-12 pt-6 flex items-center justify-between text-xs border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Last updated: July 2026
            </span>
            <a
              href="https://github.com/ALLFrontier-Labs/mvp/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              <ExternalLink className="w-3 h-3" />
              Edit on GitHub
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};
