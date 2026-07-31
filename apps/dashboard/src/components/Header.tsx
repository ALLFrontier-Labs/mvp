import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Key } from 'lucide-react';
import { Logo } from './Logo';
import { CommandPalette } from './CommandPalette';
import { ProfileDropdown } from './ProfileDropdown';
import { getStoredApiKey, clearStoredApiKey } from '../lib/api';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiKey = getStoredApiKey();
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleLogout = () => {
    clearStoredApiKey();
    navigate('/auth');
  };

  const navLinks = [
    { label: 'Home',       path: '/' },
    { label: 'Tools',      path: '/providers' },
    { label: 'Playground', path: '/playground' },
    { label: 'Rankings',   path: '/providers' },
    { label: 'Apps',       path: '/dashboard' },
    { label: 'Docs',       path: '/docs' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#09090b] border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between font-sans">
        
        {/* LEFT COLUMN: Logo + Search Trigger Input */}
        <div className="flex items-center gap-4">
          <Logo />

          <button
            onClick={() => setIsCmdOpen(true)}
            className="hidden sm:flex items-center gap-6 px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-400 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search...</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-mono font-semibold">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* RIGHT COLUMN: Nav Links & Actions */}
        <div className="flex items-center gap-5">
          <nav className="hidden md:flex items-center gap-5 text-sm text-zinc-300">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`transition-colors ${isActive ? 'text-white font-semibold' : 'hover:text-white'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {apiKey ? (
              <>
                <ProfileDropdown onLogout={handleLogout} balanceUsd={null} />
                <Link
                  to="/keys"
                  className="bg-[#ccff00] text-black font-semibold px-3.5 py-1.5 rounded-md text-sm hover:bg-yellow-300 transition-colors"
                >
                  Get Master Key
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-zinc-300 hover:text-white font-medium">
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="bg-[#ccff00] text-black font-semibold px-3.5 py-1.5 rounded-md text-sm hover:bg-yellow-300 transition-colors"
                >
                  Get Master Key
                </Link>
              </>
            )}
          </div>
        </div>

      </header>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </>
  );
};

export const Navbar = Header;
