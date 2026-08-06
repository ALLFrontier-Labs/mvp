import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, Database, Globe, UserCheck, Mail, ArrowLeft, Calendar, Cookie, Trash2 } from 'lucide-react';

const LAST_UPDATED = 'August 6, 2026';

export const Privacy: React.FC = () => {
  return (
    <div 
      className="min-h-screen font-sans selection:bg-lime-400 selection:text-zinc-950 py-16 px-4 sm:px-6 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Back Links */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <Link to="/auth" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign Up
          </Link>
          <span>•</span>
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            Back to Home
          </Link>
          <span>•</span>
          <Link to="/security" className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors">
            Security Overview
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Security &amp; Data Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Privacy Content Modules */}
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          
          {/* Module 1: Zero Payload Retention */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              <EyeOff className="w-6 h-6" />
              <h2>1. Zero Payload Retention Guarantee</h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              LiteDaemon is engineered as a strict pass-through proxy. Prompt contents, web scraping output bodies, browser CDP execution steps, document contents, and search query parameters stream strictly through isolated in-memory channels.
            </p>
            <div className="p-4 rounded-xl border text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20 space-y-1">
              <div>✓ Payloads are processed 100% in-memory — never written to disk or database.</div>
              <div>✓ Web scrape outputs, prompt text, and search bodies are NEVER stored.</div>
              <div>✓ We NEVER sell, share, monetize, or train models on your application data.</div>
              <div>✓ Server logs are automatically redacted — API keys, tokens, and request bodies are scrubbed.</div>
            </div>
          </section>

          {/* Module 2: Data We Collect */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 font-bold text-lg">
              <Database className="w-6 h-6" />
              <h2>2. Data We Collect</h2>
            </div>
            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              <div>
                <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-1">Account Information</h3>
                <p>Email address, first name, last name (optional), and hashed password (PBKDF2-SHA512, 100k iterations). If you sign in via Google OAuth, we receive your Google profile email and name only.</p>
              </div>
              <div>
                <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-1">Billing &amp; Financial Data</h3>
                <p>Wallet balance, transaction ledger entries (credits, debits, gateway fees), and payment metadata (processed by Dodo Payments — we never store full card numbers, CVVs, or bank details).</p>
              </div>
              <div>
                <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-1">Usage Telemetry (Non-Sensitive)</h3>
                <p>Request counts, timestamps, HTTP status codes, execution duration (milliseconds), provider routing decisions, and rate limit counters. These metrics never include request or response bodies.</p>
              </div>
              <div>
                <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-1">BYOK Provider Keys</h3>
                <p>Your third-party API keys (Tavily, Firecrawl, E2B, etc.) are encrypted at rest using AES-256-GCM. Plaintext keys exist only in isolated runtime memory during active proxy requests.</p>
              </div>
            </div>
          </section>

          {/* Module 3: Data We Don't Collect */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-lg">
              <EyeOff className="w-6 h-6" />
              <h2>3. Data We Never Collect or Store</h2>
            </div>
            <ul className="space-y-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 list-disc pl-5">
              <li>Prompt text, search queries, or AI model outputs</li>
              <li>Scraped webpage content or document parsing results</li>
              <li>Browser session recordings, screenshots, or DOM snapshots</li>
              <li>Code execution outputs from sandbox environments</li>
              <li>Plaintext API keys — stored only as AES-256-GCM ciphertext</li>
              <li>Credit card numbers, CVVs, or bank account details</li>
              <li>Tracking cookies, advertising identifiers, or fingerprints</li>
            </ul>
          </section>

          {/* Module 4: How We Store & Protect Data */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold text-lg">
              <Lock className="w-6 h-6" />
              <h2>4. How We Store &amp; Protect Your Data</h2>
            </div>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/10">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Encryption at Rest</div>
                  <div>AES-256-GCM for all provider API keys. Passwords hashed with PBKDF2-SHA512 (100,000 iterations).</div>
                </div>
                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/10">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Encryption in Transit</div>
                  <div>All connections use TLS 1.2+ (HTTPS). HSTS headers enforced with preload.</div>
                </div>
                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/10">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Database</div>
                  <div>PostgreSQL via Supabase with SSL, parameterized queries (zero SQL injection surface), and row-level locking.</div>
                </div>
                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/10">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Log Redaction</div>
                  <div>Server logs automatically scrub API keys, auth tokens, passwords, and request/response bodies.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Module 5: Third-Party Processors */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-bold text-lg">
              <Globe className="w-6 h-6" />
              <h2>5. Third-Party Data Processors</h2>
            </div>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="py-2 pr-4 font-semibold text-zinc-800 dark:text-zinc-200">Service</th>
                      <th className="py-2 pr-4 font-semibold text-zinc-800 dark:text-zinc-200">Purpose</th>
                      <th className="py-2 font-semibold text-zinc-800 dark:text-zinc-200">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4">Supabase (PostgreSQL)</td>
                      <td className="py-2 pr-4">Database hosting</td>
                      <td className="py-2">Account data, encrypted keys, ledger</td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4">Upstash (Redis)</td>
                      <td className="py-2 pr-4">Caching & rate limiting</td>
                      <td className="py-2">Auth cache (user IDs, hashed keys)</td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4">Dodo Payments</td>
                      <td className="py-2 pr-4">Payment processing</td>
                      <td className="py-2">Email, deposit amount, user ID</td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4">Google OAuth</td>
                      <td className="py-2 pr-4">Authentication</td>
                      <td className="py-2">Email, name (from Google profile)</td>
                    </tr>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4">Railway</td>
                      <td className="py-2 pr-4">API hosting</td>
                      <td className="py-2">Server logs (redacted)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">Dashboard hosting</td>
                      <td className="py-2">Static assets only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Module 6: Data Retention */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold text-lg">
              <Calendar className="w-6 h-6" />
              <h2>6. Data Retention</h2>
            </div>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans list-disc pl-5">
              <li><strong className="text-zinc-800 dark:text-zinc-200">Account data:</strong> Retained as long as your account is active.</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Ledger entries:</strong> Retained indefinitely for financial audit compliance (append-only, immutable).</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Job metadata:</strong> Retained for 90 days, then automatically purged.</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">API session keys:</strong> Automatically rotated. Old keys are deactivated (max 10 active per account).</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Server logs:</strong> Retained for 30 days, then deleted.</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Request/response payloads:</strong> Never stored. Zero retention.</li>
            </ul>
          </section>

          {/* Module 7: Cookies & Local Storage */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 font-bold text-lg">
              <Cookie className="w-6 h-6" />
              <h2>7. Cookies &amp; Local Storage</h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              LiteDaemon does <strong className="text-zinc-800 dark:text-zinc-200">not</strong> use tracking cookies, advertising pixels, or third-party analytics scripts. We use browser <code className="px-1.5 py-0.5 rounded bg-zinc-800/10 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">localStorage</code> to store your LiteDaemon API session key for dashboard authentication. This key is never shared with third parties and can be cleared by logging out.
            </p>
          </section>

          {/* Module 8: Your Rights */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 font-bold text-lg">
              <UserCheck className="w-6 h-6" />
              <h2>8. Your Rights</h2>
            </div>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              <p>You have the right to:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong className="text-zinc-800 dark:text-zinc-200">Access:</strong> Request a copy of all personal data we hold about you.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Rectification:</strong> Correct inaccurate personal data.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Deletion:</strong> Request deletion of your account and all associated data (excluding immutable ledger records required for financial compliance).</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Portability:</strong> Export your data in a machine-readable format.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Withdraw consent:</strong> Revoke Google OAuth access at any time via your Google Account settings.</li>
              </ul>
              <p>To exercise any of these rights, email <a href="mailto:privacy@litedaemon.xyz" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">privacy@litedaemon.xyz</a>. We will respond within 30 days.</p>
            </div>
          </section>

          {/* Module 9: Data Deletion */}
          <section 
            className="p-8 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-lg">
              <Trash2 className="w-6 h-6" />
              <h2>9. Account Deletion</h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              You may request full account deletion at any time by emailing <a href="mailto:privacy@litedaemon.xyz" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">privacy@litedaemon.xyz</a> from your registered email address. Upon deletion, we will permanently remove your account, encrypted API keys, and session data. Financial ledger entries will be anonymized but retained for compliance.
            </p>
          </section>

          {/* Contact */}
          <section 
            className="p-6 rounded-2xl border font-mono text-xs text-zinc-500 space-y-3"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>Questions regarding data privacy?</span>
              <a href="mailto:privacy@litedaemon.xyz" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                privacy@litedaemon.xyz →
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>Report a security vulnerability?</span>
              <a href="mailto:security@litedaemon.xyz" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                security@litedaemon.xyz →
              </a>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
