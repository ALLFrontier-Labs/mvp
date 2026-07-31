import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Key,
  Sliders
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

interface ProfileDropdownProps {
  onLogout: () => void;
  balanceUsd?: number | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onLogout }) => {
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
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Exact OpenRouter Profile Trigger: Avatar + Name + Chevron */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-zinc-200 hover:text-white transition-colors focus:outline-none cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-purple-600/80 text-white font-bold text-[11px] flex items-center justify-center">
          A
        </div>
        <span className="font-medium">Personal</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Exact OpenRouter Dropdown Menu Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900/95 border border-zinc-800 shadow-2xl p-2 z-50 text-xs text-zinc-300 space-y-1 backdrop-blur-md dark:bg-zinc-900/95 dark:border-zinc-800 dark:text-zinc-300 light:bg-white light:border-zinc-200 light:text-zinc-700 light:shadow-xl font-sans">
          
          {/* Menu Header */}
          <div className="flex items-center justify-between px-2.5 py-2 border-b border-zinc-800/80 light:border-zinc-100">
            <div className="flex items-center gap-2 font-semibold text-zinc-100 light:text-zinc-900">
              <div className="w-5 h-5 rounded-full bg-purple-600/80 text-white font-bold text-[10px] flex items-center justify-center">
                A
              </div>
              <span>Personal</span>
            </div>
            <Link to="/settings" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-200 light:hover:text-zinc-900">
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Menu Items List */}
          <div className="py-1 space-y-0.5">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Workspaces</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Profile</span>
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>Activity</span>
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Logs</span>
            </Link>
            <Link
              to="/keys"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>Keys &amp; Vault</span>
            </Link>
            <Link
              to="/playground"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-zinc-400" />
              <span>Labs</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/70 light:hover:bg-zinc-100 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>Preferences</span>
            </Link>

            {/* Sign Out (Red Accent) */}
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Functional Theme Switcher Segmented Control */}
          <div className="pt-2 border-t border-zinc-800/80 light:border-zinc-100">
            <div className="grid grid-cols-3 p-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 light:bg-zinc-100 light:border-zinc-200">
              {/* Sun / Light */}
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center py-1 rounded-md transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-zinc-800 text-amber-400 shadow-sm light:bg-white light:text-amber-500'
                    : 'hover:text-zinc-200'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Moon / Dark */}
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center py-1 rounded-md transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm light:bg-white light:text-zinc-900'
                    : 'hover:text-zinc-200'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              {/* Monitor / System */}
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center py-1 rounded-md transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-zinc-800 text-lime-400 shadow-sm light:bg-white light:text-lime-600'
                    : 'hover:text-zinc-200'
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
