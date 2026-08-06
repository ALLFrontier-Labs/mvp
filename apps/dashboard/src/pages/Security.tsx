import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Server, Eye, Key, Globe, Mail, ArrowLeft,
  ShieldCheck, AlertTriangle, CheckCircle2, Copy, Check, Bug
} from 'lucide-react';

const SECURITY_EMAIL = 'security@litedaemon.xyz';

export const Security: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SECURITY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div
      className="min-h-screen font-sans selection:bg-lime-400 selection:text-zinc-950 py-16 px-4 sm:px-6 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Navigation */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>•</span>
          <Link to="/privacy" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/docs" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            Documentation
          </Link>
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Security Architecture &amp; Responsible Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Security at LiteDaemon
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Security is foundational to LiteDaemon's architecture, not an afterthought. As a BYOK gateway that handles your provider API keys, we hold ourselves to the highest standards of encryption, access control, and operational security.
          </p>
        </div>

        {/* Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Lock className="w-5 h-5" />,
              title: 'AES-256-GCM Key Vault',
              description: 'All BYOK provider API keys are encrypted at rest using AES-256-GCM with random 12-byte IVs. Plaintext keys exist only in isolated runtime memory for the duration of a single HTTP proxy request.',
              color: 'emerald',
            },
            {
              icon: <Eye className="w-5 h-5" />,
              title: 'Zero Payload Retention',
              description: 'LiteDaemon is a strict pass-through proxy. Prompts, scrape results, browser sessions, and execution outputs stream through in-memory channels and are never persisted to disk or database.',
              color: 'teal',
            },
            {
              icon: <Key className="w-5 h-5" />,
              title: 'PBKDF2-SHA512 Password Hashing',
              description: 'User passwords are hashed using PBKDF2-SHA512 with 100,000 iterations and cryptographically random 16-byte salts. Password comparison uses timing-safe equality checks.',
              color: 'blue',
            },
            {
              icon: <Server className="w-5 h-5" />,
              title: 'Parameterized SQL — Zero Injection',
              description: 'Every database query uses parameterized statements. No SQL string concatenation exists in the codebase. All financial operations use SELECT FOR UPDATE row-level locking.',
              color: 'cyan',
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: 'HTTPS/TLS Everywhere',
              description: 'All traffic is encrypted in transit with TLS 1.2+. HSTS headers are enforced with includeSubDomains and preload directives. API endpoints reject non-HTTPS connections.',
              color: 'purple',
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: 'Security Headers',
              description: 'Every API response includes Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options (DENY), Content-Security-Policy, Referrer-Policy, and Permissions-Policy headers.',
              color: 'indigo',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border space-y-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className={`flex items-center gap-2.5 text-${item.color}-600 dark:text-${item.color}-400 font-bold text-sm`}>
                {item.icon}
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Security Measures */}
        <section
          className="p-8 rounded-3xl border space-y-5 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 text-lime-600 dark:text-lime-400 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6" />
            <h2>Additional Security Controls</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            {[
              'Webhook signature verification (timing-safe HMAC)',
              'Per-IP rate limiting on all auth endpoints',
              'Global DDoS protection (200 req/min per IP)',
              'Per-user rate limiting (plan-based quotas)',
              'Strict CORS origin whitelist (no wildcard matching)',
              'Automatic API key rotation (max 10 active per account)',
              'Structured log redaction (keys, tokens, passwords stripped)',
              'Atomic wallet debits with SELECT FOR UPDATE (no overdrafts)',
              'Immutable append-only financial ledger (no UPDATE/DELETE)',
              'Input validation on all public endpoints',
              'OAuth redirect URI whitelist enforcement',
              'Redis graceful degradation with conservative in-memory fallback',
            ].map((measure) => (
              <div key={measure} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{measure}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section
          className="p-8 rounded-3xl border space-y-5 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold text-lg">
            <Bug className="w-6 h-6" />
            <h2>Responsible Disclosure Policy</h2>
          </div>
          <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            <p>
              We take security vulnerabilities seriously and appreciate responsible disclosure from the security research community. If you discover a vulnerability in LiteDaemon's systems, please report it responsibly.
            </p>

            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 space-y-3">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Disclosure Guidelines</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>Email your findings to <strong className="text-amber-600 dark:text-amber-400">{SECURITY_EMAIL}</strong></li>
                <li>Include a detailed description of the vulnerability, steps to reproduce, and potential impact</li>
                <li>Allow us reasonable time (90 days) to investigate and remediate before public disclosure</li>
                <li>Do not access, modify, or delete data belonging to other users</li>
                <li>Do not perform denial-of-service attacks or social engineering</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-2">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">In Scope</h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Authentication and authorization bypasses</li>
                <li>API key leakage or encryption weaknesses</li>
                <li>Injection vulnerabilities (SQL, XSS, SSRF)</li>
                <li>CORS misconfigurations</li>
                <li>Payment/billing logic flaws</li>
                <li>Data exposure or privacy violations</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border bg-zinc-500/5 border-zinc-500/20 space-y-2">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Out of Scope</h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Third-party provider vulnerabilities (Tavily, Firecrawl, E2B, etc.)</li>
                <li>Social engineering or phishing attempts</li>
                <li>Denial-of-service attacks</li>
                <li>Issues in third-party dependencies without a demonstrated exploit path</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Contact Card */}
        <section
          className="p-8 rounded-3xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            <Mail className="w-6 h-6" />
            <h2>Security Contact</h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For security-related inquiries, vulnerability reports, or questions about our security practices, please contact us at:
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`mailto:${SECURITY_EMAIL}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              {SECURITY_EMAIL}
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 hover:bg-zinc-800/10 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            Response time: We aim to acknowledge reports within 24 hours and provide a resolution timeline within 72 hours.
          </p>
        </section>

        {/* RFC 9116 Notice */}
        <section
          className="p-4 rounded-2xl border font-mono text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <span>RFC 9116 security.txt available at <code className="text-zinc-400">/.well-known/security.txt</code></span>
          <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Privacy Policy →
          </Link>
        </section>
      </div>
    </div>
  );
};
