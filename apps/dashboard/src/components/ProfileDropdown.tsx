import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Building2,
  Activity,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

interface ProfileDropdownProps {
  onLogout: () => void;
  balanceUsd?: number | null;
  activeWorkspaceName?: string;
  onOpenWorkspaces?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onLogout,
  activeWorkspaceName = 'Personal',
  onOpenWorkspaces,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative font-sans selection:bg-lime-400 selection:text-zinc-950" ref={dropdownRef}>
      {/* OpenRouter Profile Trigger: Avatar + Name + Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors focus:outline-none cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
      >
        <div className="w-6 h-6 rounded-full bg-purple-600/80 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
          {activeWorkspaceName.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold max-w-[120px] truncate">{activeWorkspaceName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-lime-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl p-2 z-50 text-xs text-zinc-700 dark:text-zinc-300 space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95">
          
          {/* Menu Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 font-mono">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 min-w-0">
              <div className="w-5 h-5 rounded-full bg-purple-600/80 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                {activeWorkspaceName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{activeWorkspaceName}</span>
            </div>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
              title="Account Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Account Management Items List */}
          <div className="py-1 space-y-0.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenWorkspaces) onOpenWorkspaces();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left"
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Workspaces</span>
            </button>

            <Link
              to="/settings?tab=general"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Profile &amp; Account</span>
            </Link>

            <Link
              to="/settings?tab=billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Billing &amp; Wallet</span>
            </Link>

            <Link
              to="/logs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Usage &amp; Activity</span>
            </Link>

            <Link
              to="/settings?tab=webhooks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Preferences &amp; Security</span>
            </Link>

            {/* Sign Out (Danger Hover Styling) */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer text-left font-bold"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Functional Theme Switcher Segmented Control */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 font-mono text-xs">
            <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
              {/* Sun / Light */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-500 shadow-sm font-bold'
                    : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Moon / Dark */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-lime-400 shadow-sm font-bold'
                    : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              {/* Monitor / System */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm font-bold'
                    : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="System Preference"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
