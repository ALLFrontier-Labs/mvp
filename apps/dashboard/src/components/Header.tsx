import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
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
    calls: '10 Metered Calls',
    balance: '$9.9500 Balance',
    keysCount: 6,
    billingType: 'Personal Prepaid',
  });
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearStoredApiKey();
    // Also clear session cookies if set
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
        className="sticky top-0 z-40 w-full border-b px-4 h-14 flex items-center justify-between font-sans backdrop-blur-md transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          borderColor: 'var(--border)',
        }}
      >
        {/* LEFT: Logo + Search */}
        <div className="flex items-center gap-4">
          <Logo />

          {/* Search trigger */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg border text-xs transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              width: '220px',
            }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Search tools...</span>
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* RIGHT: Nav + Actions */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="relative transition-colors text-sm font-medium hover:text-[var(--text-primary)]"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-[18px] left-0 w-full h-[2px] rounded-full transition-all"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {!apiKey ? (
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
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
