import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Globe,
  Code2,
  FileText,
  Key,
  CreditCard,
  Settings,
  History,
  FlaskConical,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Tools' | 'Vault & Settings' | 'Docs & Features';
  icon: React.ElementType;
  path: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Tools
  { id: 'tool-scrape',    title: 'Firecrawl Web Scraper',     category: 'Tools',            icon: Globe,        path: '/playground' },
  { id: 'tool-search',    title: 'Tavily Search API',         category: 'Tools',            icon: Search,       path: '/playground' },
  { id: 'tool-browser',   title: 'Browserbase CDP Session',   category: 'Tools',            icon: Zap,          path: '/playground' },
  { id: 'tool-execute',   title: 'E2B Sandbox Execution',     category: 'Tools',            icon: Code2,        path: '/playground' },
  { id: 'tool-document',  title: 'LlamaParse Document',       category: 'Tools',            icon: FileText,     path: '/playground' },

  // Vault & Settings
  { id: 'vault-keys',     title: 'BYOK Key Vault',            category: 'Vault & Settings', icon: Key,          path: '/keys' },
  { id: 'vault-billing',  title: 'Credits & Wallet Balance',  category: 'Vault & Settings', icon: CreditCard,   path: '/billing' },
  { id: 'vault-settings', title: 'Account Settings',          category: 'Vault & Settings', icon: Settings,     path: '/settings' },

  // Docs & Features
  { id: 'docs-quickstart',title: 'Interactive Playground',    category: 'Docs & Features',  icon: FlaskConical, path: '/playground' },
  { id: 'docs-catalog',   title: 'Tool Provider Catalog',     category: 'Docs & Features',  icon: Layers,       path: '/providers' },
  { id: 'docs-logs',      title: 'Execution Logs',            category: 'Docs & Features',  icon: History,      path: '/jobs' },
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-xl bg-[#09090b] border border-zinc-800 shadow-2xl overflow-hidden z-10 text-slate-100">
        
        {/* A. TOP INPUT BAR */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800/80 bg-[#09090b]">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          <span className="text-zinc-500 text-xs px-1.5 py-0.5 rounded bg-zinc-800/60 font-mono shrink-0 ml-2">
            esc
          </span>
        </div>

        {/* B. COMPACT ITEM LIST (STRIPPED DESCRIPTIONS) */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono">
              No matching commands or tools found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-0.5">
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
                        className={`w-full py-2.5 px-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-left ${
                          isSelected
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-300 hover:bg-zinc-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                          <span className="text-xs">{item.title}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-600'}`} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* C. CLEAN FOOTER BAR (FIXED SHORTCUTS) */}
        <div className="bg-[#09090b] border-t border-zinc-800/80 px-3 py-2 text-xs flex items-center justify-between text-zinc-400 font-sans">
          <div className="flex items-center">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 font-mono">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1.5 ml-3">
              <kbd className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 font-mono">↵</kbd> Select
            </span>
          </div>

          <kbd className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
            ⌘ K
          </kbd>
        </div>

      </div>
    </div>
  );
};
