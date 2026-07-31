import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Search,
  Key,
  X,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { getStoredApiKey, clearStoredApiKey, api } from '../lib/api';
import { CommandPalette } from './CommandPalette';
import { ProfileDropdown } from './ProfileDropdown';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiKey = getStoredApiKey();
  const [balance, setBalance] = useState<number | null>(null);

  // Command palette state
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Top announcement banner state (remember dismissal in localStorage)
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('litedaemon_banner_dismissed') !== 'true';
  });

  const dismissBanner = () => {
    localStorage.setItem('litedaemon_banner_dismissed', 'true');
    setShowBanner(false);
  };

  useEffect(() => {
    if (apiKey && location.pathname !== '/auth') {
      api.getUsage()
        .then((data) => setBalance(data.balance_usd))
        .catch(() => setBalance(null));
    }
  }, [apiKey, location.pathname]);

  const handleLogout = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  const navItems = [
    { label: 'Overview',       path: '/dashboard', protected: true },
    { label: 'Tools & Vault',  path: '/keys',      protected: true },
    { label: 'Execution Logs', path: '/jobs',      protected: true },
    { label: 'Docs',           path: '/playground',protected: true },
    { label: 'Pricing',        path: '/billing',   protected: true },
  ];

  return (
    <>
      {/* ── 1. Top Announcement Banner ─────────────────────────────────── */}
      {showBanner && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 border-b border-emerald-500/20 text-xs font-mono text-slate-300 py-2 px-4 flex items-center justify-between z-50">
          <div className="max-w-6xl mx-auto flex-1 flex items-center justify-center gap-2 text-center">
            <span className="text-emerald-400 font-bold">⚡ 1,000 Free BYOK Tool Executions Every Month</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Zero Monthly Subscription</span>
            <Link
              to="/billing"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline ml-2 flex items-center gap-0.5"
            >
              View Pricing →
            </Link>
          </div>

          <button
            onClick={dismissBanner}
            className="p-1 text-slate-500 hover:text-slate-200 transition-colors ml-2"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 2. Main Navigation Header (OpenRouter Dark Aesthetic) ───────── */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Side: Brand Logo with Operational Status Dot */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#09090b] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  LiteDaemon
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 font-mono text-xs">
              {navItems.map((item) => {
                if (item.protected && !apiKey) return null;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Command Search, OpenRouter Neon CTA & User Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Search Trigger Button (Command Palette ⌘K) */}
            <button
              onClick={() => setIsCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-mono transition-all group"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              <span>Search tools, keys, docs...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-bold ml-1">
                ⌘K
              </kbd>
            </button>

            {/* OpenRouter-Style Neon Yellow Master Key CTA Button */}
            <Link
              to="/keys"
              className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-[#ccff00]/10 shrink-0"
            >
              <Key className="w-3.5 h-3.5 text-black" />
              <span>Get Master Key</span>
            </Link>

            {/* User Profile Dropdown */}
            {apiKey ? (
              <ProfileDropdown onLogout={handleLogout} balanceUsd={balance} />
            ) : (
              <Link
                to="/auth"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* ── 3. Command Palette Modal (⌘K) ─────────────────────────────────── */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </>
  );
};
