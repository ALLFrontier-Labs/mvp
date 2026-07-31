import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] py-12 px-6 font-mono text-xs text-zinc-400 selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1 (Brand) */}
        <div className="space-y-4 font-sans">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">LiteDaemon</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>🟢 All Systems Operational</span>
          </div>
          <p className="text-zinc-500 text-xs font-mono">
            © 2026 LiteDaemon Inc. All rights reserved.
          </p>
        </div>

        {/* Col 2 (Product) */}
        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/playground" className="hover:text-white transition-colors">Playground</Link></li>
            <li><Link to="/providers" className="hover:text-white transition-colors">Rankings</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Apps</Link></li>
            <li><Link to="/providers" className="hover:text-white transition-colors">Tools</Link></li>
            <li><Link to="/providers" className="hover:text-white transition-colors">Providers</Link></li>
            <li><Link to="/billing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Col 3 (Company) */}
        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/docs" className="hover:text-white transition-colors">Blog</Link></li>
            <li>
              <a href="https://status.litedaemon.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                Status <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </a>
            </li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Col 4 (Developer & Community) */}
        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold uppercase text-white tracking-wider font-sans">Developer &amp; Community</h4>
          <ul className="space-y-2">
            <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link to="/docs" className="hover:text-white transition-colors">API Reference</Link></li>
            <li><Link to="/docs" className="hover:text-white transition-colors">SDKs</Link></li>
            <li>
              <a href="https://discord.gg/litedaemon" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                Discord <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </a>
            </li>
            <li>
              <a href="https://github.com/ALLFrontier-Labs/mvp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                GitHub <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </a>
            </li>
            <li>
              <a href="https://twitter.com/litedaemon" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                X <ArrowUpRight className="w-3 h-3 text-zinc-600" />
              </a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};
