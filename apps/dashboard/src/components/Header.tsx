import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Activity, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { CommandPalette } from './CommandPalette';
import { ProfileDropdown } from './ProfileDropdown';
import { WorkspaceModal, WorkspaceItem } from './WorkspaceModal';
import { getStoredApiKey, clearStoredApiKey } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const apiKey    = getStoredApiKey();
  const [isCmdOpen, setIsCmdOpen]                     = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace]         = useState<WorkspaceItem>({
    id: 'ws-personal',
    name: 'Personal Workspace',
    role: 'Owner',
    calls: '',
    balance: '',
    keysCount: 0,
    billingType: 'Personal Prepaid',
  });
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearStoredApiKey();
    document.cookie = 'litedaemon_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'litedaemon_api_key=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    navigate('/login');
  };

  const navLinks = apiKey
    ? [
        { label: 'Overview',     path: '/overview' },
        { label: 'Keys & Vault', path: '/keys' },
        { label: 'Logs',         path: '/jobs' },
        { label: 'Tools',        path: '/providers' },
        { label: 'Playground',   path: '/playground' },
        { label: 'Rankings',     path: '/rankings' },
        { label: 'Settings',     path: '/settings' },
        { label: 'Docs',         path: '/docs' },
      ]
    : [
        { label: 'Home',       path: '/' },
        { label: 'Tools',      path: '/providers' },
        { label: 'Playground', path: '/playground' },
        { label: 'Rankings',   path: '/rankings' },
        { label: 'Docs',       path: '/docs' },
      ];

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b px-4 h-14 flex items-center justify-between font-sans backdrop-blur-xl transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          borderColor: 'var(--border)',
        }}
      >
        {/* LEFT: Logo + Operational Status + Search */}
        <div className="flex items-center gap-4">
          <Logo />

          {/* Operational Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-mono text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="font-medium">Operational</span>
            <span className="text-zinc-500 dark:text-zinc-600">|</span>
            <span className="text-emerald-400/90 font-semibold">12ms</span>
          </div>

          {/* Quick Command Palette Launcher */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg border text-xs transition-all hover:border-[var(--border-active)] cursor-pointer group"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              width: '210px',
            }}
          >
            <Search className="w-3.5 h-3.5 shrink-0 group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="flex-1 text-left group-hover:text-[var(--text-primary)] transition-colors">Search tools & docs...</span>
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-0.5"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* RIGHT: Nav Links + Theme Switcher + Profile */}
        <div className="flex items-center gap-5">
          <nav className="hidden md:flex items-center gap-1 text-sm relative">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="relative px-3 py-1.5 rounded-md transition-colors text-xs font-medium"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border transition-all hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {!apiKey ? (
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--accent)', color: '#08090a' }}
              >
                Sign Up
              </Link>
            ) : (
              <ProfileDropdown
                onLogout={handleLogout}
                activeWorkspaceName={activeWorkspace.name}
                onOpenWorkspaces={() => setIsWorkspaceModalOpen(true)}
              />
            )}
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        activeWorkspaceId={activeWorkspace.id}
        onSelectWorkspace={(ws) => setActiveWorkspace(ws)}
      />
    </>
  );
};

export const Navbar = Header;
