import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Lock,
  Globe,
  Code2,
  FileText,
  Key,
  CreditCard,
  Settings,
  History,
  FlaskConical,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tools' | 'Vault & Settings' | 'Docs & Features';
  icon: React.ElementType;
  path: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Tools
  { id: 'tool-scrape',    title: 'Firecrawl Web Scraper',     subtitle: '/v1/scrape — Extract clean markdown & HTML', category: 'Tools',            icon: Globe,        path: '/playground' },
  { id: 'tool-search',    title: 'Tavily Search API',         subtitle: '/v1/search — Unified web search results',     category: 'Tools',            icon: Search,       path: '/playground' },
  { id: 'tool-browser',   title: 'Browserbase CDP Session',   subtitle: '/v1/browser — Remote browser execution',      category: 'Tools',            icon: Zap,          path: '/playground' },
  { id: 'tool-execute',   title: 'E2B Sandbox Execution',     subtitle: '/v1/execute — Secure python/js execution',   category: 'Tools',            icon: Code2,        path: '/playground' },
  { id: 'tool-document',  title: 'LlamaParse Document',       subtitle: '/v1/document — PDF & document parsing',      category: 'Tools',            icon: FileText,     path: '/playground' },

  // Vault & Settings
  { id: 'vault-keys',     title: 'BYOK Key Vault',            subtitle: 'Manage prioritized & fallback API keys',       category: 'Vault & Settings', icon: Key,          path: '/keys' },
  { id: 'vault-billing',  title: 'Credits & Wallet Balance',  subtitle: 'Prepaid wallet top-up & LemonSqueezy billing',  category: 'Vault & Settings', icon: CreditCard,   path: '/billing' },
  { id: 'vault-settings', title: 'Account Settings',          subtitle: 'Workspace preferences & security settings',    category: 'Vault & Settings', icon: Settings,     path: '/settings' },

  // Docs & Features
  { id: 'docs-quickstart',title: 'Interactive Playground',    subtitle: 'Test 30+ tools live in browser',              category: 'Docs & Features',  icon: FlaskConical, path: '/playground' },
  { id: 'docs-catalog',   title: 'Tool Provider Catalog',     subtitle: 'Browse 30+ supported tool adapters',           category: 'Docs & Features',  icon: Layers,       path: '/providers' },
  { id: 'docs-logs',      title: 'Execution Logs',            subtitle: 'View detailed gateway request history',        category: 'Docs & Features',  icon: History,      path: '/jobs' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          // Handled externally or parent state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      } else if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        } else if (e.key === 'Enter' && filteredItems.length > 0) {
          e.preventDefault();
          const target = filteredItems[selectedIndex];
          if (target) {
            navigate(target.path);
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  const categories: Array<'Tools' | 'Vault & Settings' | 'Docs & Features'> = [
    'Tools',
    'Vault & Settings',
    'Docs & Features',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl bg-[#09090b] border border-zinc-800 shadow-2xl overflow-hidden z-10 font-sans text-slate-100">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-950">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tools, keys, docs..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-zinc-500 hover:text-white mr-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4 font-sans text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono">
              No matching commands or tools found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.path);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-zinc-800 text-white border border-emerald-500/40'
                            : 'text-zinc-300 hover:bg-zinc-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{item.title}</p>
                            <p className="text-[11px] text-zinc-400 font-mono">{item.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-zinc-800/80 font-mono text-[10px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">esc</kbd> Close</span>
          </div>
          <span className="text-emerald-400 font-semibold">LiteDaemon ⌘K</span>
        </div>

      </div>
    </div>
  );
};
