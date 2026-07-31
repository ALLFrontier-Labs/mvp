import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Activity,
  History,
  CreditCard,
  FlaskConical,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProfileDropdownProps {
  onLogout: () => void;
  balanceUsd: number | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onLogout, balanceUsd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Workspaces',         icon: Building2,    path: '/settings' },
    { label: 'Profile',            icon: User,         path: '/settings' },
    { label: 'Activity',           icon: Activity,     path: '/dashboard' },
    { label: 'Logs',               icon: History,      path: '/jobs' },
    { label: 'Credits & Balance',  icon: CreditCard,   path: '/billing', badge: balanceUsd !== null ? `$${balanceUsd.toFixed(2)}` : null },
    { label: 'Labs / Features',    icon: FlaskConical, path: '/playground' },
    { label: 'Preferences',        icon: Settings,     path: '/settings' },
  ];

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none ring-2 ring-zinc-800 hover:ring-emerald-500/50"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-md">
          LD
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Menu Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#09090b] border border-zinc-800/90 shadow-2xl overflow-hidden z-50 text-slate-100 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header: Active Account Info */}
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Personal Workspace</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO BYOK
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-1 truncate">
              developer@litedaemon.com
            </p>
          </div>

          {/* Menu Items List */}
          <div className="p-2 space-y-0.5 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer: Theme Toggle & Sign Out */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 space-y-2">
            
            {/* Theme Toggle Options */}
            <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-400">
              <span>Theme:</span>
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {[
                  { id: 'light',  icon: Sun },
                  { id: 'dark',   icon: Moon },
                  { id: 'system', icon: Monitor },
                ].map((t) => {
                  const TIcon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-1 rounded transition-colors ${isSelected ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title={t.id}
                    >
                      <TIcon className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
