import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  LayoutDashboard, 
  Layers, 
  History, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut, 
  Wallet,
  ExternalLink,
  Key,
  FlaskConical,
} from 'lucide-react';
import { getStoredApiKey, clearStoredApiKey, api } from '../lib/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiKey = getStoredApiKey();
  const [balance, setBalance] = useState<number | null>(null);

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
    { label: 'Dashboard',        path: '/dashboard',  icon: LayoutDashboard, protected: true },
    { label: 'Providers Catalog',path: '/providers',  icon: Layers,          protected: false },
    { label: 'Playground',       path: '/playground', icon: FlaskConical,    protected: true },
    { label: 'Job History',      path: '/jobs',       icon: History,         protected: true },
    { label: 'My Keys (BYOK)',   path: '/keys',       icon: Key,             protected: true },
    { label: 'Billing & Wallet', path: '/billing',    icon: CreditCard,      protected: true },
    { label: 'Settings',         path: '/settings',   icon: SettingsIcon,    protected: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0d14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center">
              LiteDaemon
            </span>
            <span className="block text-[11px] text-slate-400 font-mono">BYOK Tool Gateway</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.protected && !apiKey) return null;
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Action Pills with Explicit Spacing & Breathing Room */}
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-800/80">
          {apiKey ? (
            <>
              {/* Wallet Pill */}
              <Link
                to="/billing"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30 transition-colors shadow-sm"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold">
                  {balance !== null ? `$${balance.toFixed(3)}` : '...' }
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              Sign In / Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
