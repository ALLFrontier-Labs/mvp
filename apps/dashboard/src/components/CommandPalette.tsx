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
  ChevronRight,
  Sparkles,
  Layers,
  Terminal,
  Mic,
  Volume2
} from 'lucide-react';

interface ToolItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  path: string;
}

const TOOL_ITEMS: ToolItem[] = [
  // Web & Search (7)
  { id: 'tavily',     title: 'Tavily Search API',          category: 'Web & Search',           icon: Search,   path: '/playground' },
  { id: 'perplexity', title: 'Perplexity Sonar Search',    category: 'Web & Search',           icon: Search,   path: '/playground' },
  { id: 'serper',     title: 'Serper.dev Search',          category: 'Web & Search',           icon: Search,   path: '/playground' },
  { id: 'exa',        title: 'Exa AI Neural Search',       category: 'Web & Search',           icon: Brain,    path: '/playground' },
  { id: 'bing',       title: 'Bing Web Search',            category: 'Web & Search',           icon: Search,   path: '/playground' },
  { id: 'google-custom', title: 'Google Custom Search API', category: 'Web & Search',          icon: Search,   path: '/playground' },
  { id: 'duckduckgo', title: 'DuckDuckGo Scraping Engine',category: 'Web & Search',           icon: Search,   path: '/playground' },

  // Scraping & Extraction (6)
  { id: 'firecrawl',  title: 'Firecrawl Web Scraper',      category: 'Scraping & Extraction',  icon: Globe,    path: '/playground' },
  { id: 'brightdata', title: 'BrightData Web Scraper',     category: 'Scraping & Extraction',  icon: Globe,    path: '/playground' },
  { id: 'apify',      title: 'Apify Web Scraper',          category: 'Scraping & Extraction',  icon: Globe,    path: '/playground' },
  { id: 'jina',       title: 'Jina AI Reader',             category: 'Scraping & Extraction',  icon: Sparkles, path: '/playground' },
  { id: 'spider',     title: 'Spider.cloud Scraper',       category: 'Scraping & Extraction',  icon: Globe,    path: '/playground' },
  { id: 'scrapingbee',title: 'ScrapingBee Engine',          category: 'Scraping & Extraction',  icon: Globe,    path: '/playground' },

  // Browser Automation (4)
  { id: 'browserbase',title: 'Browserbase CDP Session',    category: 'Browser Automation',     icon: Zap,      path: '/playground' },
  { id: 'steel',      title: 'Steel Browser Automation',   category: 'Browser Automation',     icon: Zap,      path: '/playground' },
  { id: 'hyperbrowser', title: 'Hyperbrowser Session',     category: 'Browser Automation',     icon: Zap,      path: '/playground' },
  { id: 'stagehand',  title: 'Stagehand Agent Engine',     category: 'Browser Automation',     icon: Zap,      path: '/playground' },

  // Code & Sandboxes (4)
  { id: 'e2b',        title: 'E2B Sandbox Execution',      category: 'Code & Sandboxes',       icon: Code2,    path: '/playground' },
  { id: 'daytona',    title: 'Daytona Code Sandbox',       category: 'Code & Sandboxes',       icon: Code2,    path: '/playground' },
  { id: 'modal',      title: 'Modal Labs Compute',         category: 'Code & Sandboxes',       icon: Terminal, path: '/playground' },
  { id: 'code-interpreter', title: 'Code Interpreter Engine', category: 'Code & Sandboxes', icon: Code2,    path: '/playground' },

  // Parsing & Documents (4)
  { id: 'unstructured', title: 'Unstructured Parsing',     category: 'Parsing & Documents',    icon: FileText, path: '/playground' },
  { id: 'llamaparse', title: 'LlamaParse Document',        category: 'Parsing & Documents',    icon: FileText, path: '/playground' },
  { id: 'marker',     title: 'Marker PDF Parser',          category: 'Parsing & Documents',    icon: FileText, path: '/playground' },
  { id: 'azure-doc',  title: 'Azure Document Intelligence', category: 'Parsing & Documents',   icon: FileText, path: '/playground' },

  // Audio, Memory & Vector (11)
  { id: 'assemblyai', title: 'AssemblyAI Transcribe',      category: 'Audio, Memory & Vector', icon: Mic,      path: '/playground' },
  { id: 'deepgram',   title: 'Deepgram Speech API',        category: 'Audio, Memory & Vector', icon: Mic,      path: '/playground' },
  { id: 'mem0',       title: 'Mem0 Long-Term Memory',      category: 'Audio, Memory & Vector', icon: Database, path: '/playground' },
  { id: 'pinecone',   title: 'Pinecone Vector Store',      category: 'Audio, Memory & Vector', icon: Layers,   path: '/playground' },
  { id: 'qdrant',     title: 'Qdrant Index Search',        category: 'Audio, Memory & Vector', icon: Database, path: '/playground' },
  { id: 'weaviate',   title: 'Weaviate Search',            category: 'Audio, Memory & Vector', icon: Database, path: '/playground' },
  { id: 'chroma',     title: 'Chroma DB Engine',           category: 'Audio, Memory & Vector', icon: Database, path: '/playground' },
  { id: 'whisper',    title: 'Whisper V3 Speech',          category: 'Audio, Memory & Vector', icon: Mic,      path: '/playground' },
  { id: 'elevenlabs', title: 'ElevenLabs Voice Synthesis', category: 'Audio, Memory & Vector', icon: Volume2,  path: '/playground' },
  { id: 'cohere',     title: 'Cohere Rerank v3',           category: 'Audio, Memory & Vector', icon: Cpu,      path: '/playground' },
  { id: 'voyage',     title: 'Voyage AI Embeddings',       category: 'Audio, Memory & Vector', icon: Cpu,      path: '/playground' },
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

  const categories = Array.from(new Set(filteredItems.map((item) => item.category)));

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
          <kbd className="bg-zinc-800 text-zinc-200 border border-zinc-700/80 px-2 py-0.5 rounded text-xs font-mono font-medium shadow-sm shrink-0 ml-2">
            esc
          </kbd>
        </div>

        {/* 36-TOOL DIRECTORY RESULTS CONTAINER */}
        <div className="max-h-[420px] overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-zinc-800 font-sans text-xs">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono">
              No matching tools or engines found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="mb-3 space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 px-2 font-mono">
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
              );
            })
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
