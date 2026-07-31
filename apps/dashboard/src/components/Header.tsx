import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Logo } from './Logo';
import { CommandPalette } from './CommandPalette';
import { ProfileDropdown } from './ProfileDropdown';
import { getStoredApiKey, clearStoredApiKey } from '../lib/api';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const apiKey    = getStoredApiKey();
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleLogout = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  const navLinks = [
    { label: 'Home',       path: '/' },
    { label: 'Tools',      path: '/providers' },
    { label: 'Playground', path: '/playground' },
    { label: 'Rankings',   path: '/rankings' },
    { label: 'Apps',       path: '/apps' },
    { label: 'Docs',       path: '/docs' },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b px-4 h-14 flex items-center justify-between font-sans backdrop-blur-md"
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

        {/* RIGHT: Nav + Action */}
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
                  className="relative transition-colors text-sm font-medium"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-[18px] left-0 w-full h-px"
                      style={{ backgroundColor: 'var(--text-primary)' }}
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
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
              >
                Sign Up
              </Link>
            ) : (
              <ProfileDropdown onLogout={handleLogout} />
            )}
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </>
  );
};

export const Navbar = Header;
