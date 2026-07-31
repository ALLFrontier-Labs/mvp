import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Lock,
  Radio,
  Github,
  Twitter,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-400 font-sans text-xs selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ── 1. Top Bar / Trust Badges Banner ─────────────────────────────── */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256-GCM Vault Encryption</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Zero Data Retention (Ephemeral Proxy)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>&lt;15ms Gateway Latency Overhead</span>
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Systems Operational</span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Columns ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & System Integrity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">LiteDaemon</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              The open-standard BYOK tool gateway for autonomous AI agents. Multi-key failover, zero payload logging, and unified execution telemetry.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-300">API Status:</span>
              <span className="text-emerald-400 font-bold">Operational</span>
            </div>
          </div>

          {/* Column 2: Product & Features */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Product &amp; Features</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/playground" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" /> Quickstarts (LangChain, CrewAI, AutoGen)
                </Link>
              </li>
              <li>
                <Link to="/keys" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> BYOK Vault Manager
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-slate-500" /> Gateway Routing &amp; Failovers
                </Link>
              </li>
              <li>
                <Link to="/billing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Pricing &amp; BYOK Allowance
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer Documentation */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Developer Docs</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/playground" className="hover:text-emerald-400 transition-colors">
                  Getting Started Quickstart
                </Link>
              </li>
              <li>
                <Link to="/keys" className="hover:text-emerald-400 transition-colors">
                  BYOK &amp; Multi-Key Rotation
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-emerald-400 transition-colors">
                  Security &amp; Encryption Spec
                </Link>
              </li>
              <li>
                <Link to="/billing" className="hover:text-emerald-400 transition-colors">
                  Pricing Policy &amp; Limits
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-emerald-400 transition-colors">
                  API Reference &amp; OpenRouter Standard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Legal */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Community &amp; Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/ALLFrontier-Labs/mvp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>GitHub (SDKs &amp; Open Source)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/litedaemon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Community</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/litedaemon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Twitter / X (@litedaemon)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li className="pt-2 border-t border-slate-800/60">
                <Link to="/privacy" className="hover:text-slate-200 transition-colors text-[11px] text-slate-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-200 transition-colors text-[11px] text-slate-500">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── 3. Bottom Bar ─────────────────────────────────────────────────── */}
      <div className="border-t border-slate-800/60 py-6 px-6 bg-slate-950 font-mono text-[11px] text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            © 2026 LiteDaemon Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for autonomous agent developers with OpenRouter-style simplicity.</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
