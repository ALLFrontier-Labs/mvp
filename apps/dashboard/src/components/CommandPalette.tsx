import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Globe,
  Code2,
  FileText,
  Brain,
  Cpu,
  Database,
  ChevronRight
} from 'lucide-react';

interface ToolItem {
  id: string;
  title: string;
  icon: React.ElementType;
  path: string;
}

const TOOL_ITEMS: ToolItem[] = [
  { id: 'tool-tavily',       title: 'Tavily Search API',          icon: Search,    path: '/playground' },
  { id: 'tool-firecrawl',    title: 'Firecrawl Web Scraper',      icon: Globe,     path: '/playground' },
  { id: 'tool-browserbase',  title: 'Browserbase CDP Session',    icon: Zap,       path: '/playground' },
  { id: 'tool-e2b',          title: 'E2B Sandbox Execution',      icon: Code2,     path: '/playground' },
  { id: 'tool-llamaparse',   title: 'LlamaParse Document',        icon: FileText,  path: '/playground' },
  { id: 'tool-exa',          title: 'Exa AI Neural Search',       icon: Brain,     path: '/playground' },
  { id: 'tool-apify',        title: 'Apify Web Crawler',          icon: Globe,     path: '/playground' },
  { id: 'tool-spider',       title: 'Spider Cloud Crawler',       icon: Globe,     path: '/playground' },
  { id: 'tool-serper',       title: 'Serper.dev Search',          icon: Search,    path: '/playground' },
  { id: 'tool-steel',        title: 'Steel Browser Automation',   icon: Zap,       path: '/playground' },
  { id: 'tool-daytona',      title: 'Daytona Code Sandbox',       icon: Code2,     path: '/playground' },
  { id: 'tool-unstructured', title: 'Unstructured Parsing',       icon: FileText,  path: '/playground' },
  { id: 'tool-brightdata',   title: 'BrightData Web Scraper',     icon: Globe,     path: '/playground' },
  { id: 'tool-perplexity',   title: 'Perplexity Sonar Search',    icon: Search,    path: '/playground' },
  { id: 'tool-assemblyai',   title: 'AssemblyAI Transcribe',      icon: Cpu,       path: '/playground' },
  { id: 'tool-mem0',         title: 'Mem0 Long-Term Memory',      icon: Database,  path: '/playground' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredItems = TOOL_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-xl bg-[#09090b] border border-zinc-800 shadow-2xl overflow-hidden z-10 text-slate-100">
        
        {/* TOP INPUT BAR */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800/80 bg-[#09090b]">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          <span className="text-zinc-500 text-xs px-1.5 py-0.5 rounded bg-zinc-800/60 font-mono shrink-0 ml-2">
            esc
          </span>
        </div>

        {/* TOOL DIRECTORY RESULTS */}
        <div className="max-h-80 overflow-y-auto p-2 font-sans text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono">
              No matching tools or engines found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                Available Tools
              </div>
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-3 py-2.5 rounded-md flex items-center justify-between cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-zinc-800/80 text-[#ccff00] font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-400'}`} />
                      <span className="text-xs">{item.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ccff00]' : 'text-zinc-500'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* PIXEL-PERFECT FOOTER & KEYBOARD SHORTCUT BADGES */}
        <div className="border-t border-zinc-800/80 bg-[#09090b] px-4 py-3 flex items-center justify-between font-sans">
          <div className="flex items-center gap-4 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded text-[11px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded text-[11px] font-mono">↓</kbd>
              <span className="text-zinc-400 ml-0.5">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded text-[11px] font-mono">↵</kbd>
              <span className="text-zinc-400 ml-0.5">Select</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-zinc-800/80 text-zinc-400 border border-zinc-700/80 rounded text-[11px] font-mono flex items-center gap-1">
              <span>⌘</span><span>K</span>
            </kbd>
          </div>
        </div>

      </div>
    </div>
  );
};
