import React from 'react';
import { Sparkles, Globe, Search, Monitor, Terminal, FileText } from 'lucide-react';

export interface PresetItem {
  id: string;
  label: string;
  endpoint: '/v1/scrape' | '/v1/search' | '/v1/browser' | '/v1/execute' | '/v1/document';
  icon: React.FC<any>;
  payload: Record<string, any>;
}

export const PRESETS: PresetItem[] = [
  {
    id: 'scrape_hn',
    label: '🧪 Scrape Hacker News',
    endpoint: '/v1/scrape',
    icon: Globe,
    payload: {
      url: 'https://news.ycombinator.com',
      format: 'markdown',
      provider: 'firecrawl',
    },
  },
  {
    id: 'search_ai',
    label: '🔍 Search AI Papers',
    endpoint: '/v1/search',
    icon: Search,
    payload: {
      query: 'latest LLM reasoning benchmarks 2026',
      limit: 5,
      provider: 'tavily',
    },
  },
  {
    id: 'browser_session',
    label: '🌐 Browser Session (Puppeteer)',
    endpoint: '/v1/browser',
    icon: Monitor,
    payload: {
      script: 'await page.goto("https://news.ycombinator.com");\nconst title = await page.title();\nreturn { title };',
      width: 1920,
      height: 1080,
      provider: 'steel',
    },
  },
  {
    id: 'execute_python',
    label: '⚡ Execute Python Code',
    endpoint: '/v1/execute',
    icon: Terminal,
    payload: {
      code: 'def main():\n    return {"status": "ok", "benchmark": "MMLU-Pro", "score": 92.4}\nprint(main())',
      timeout: 30,
      provider: 'e2b',
    },
  },
];

export interface PlaygroundPresetsProps {
  onSelectPreset: (preset: PresetItem) => void;
}

export const PlaygroundPresets: React.FC<PlaygroundPresetsProps> = ({ onSelectPreset }) => {
  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center gap-1.5 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
        <Sparkles className="w-3.5 h-3.5 text-lime-500" /> Quick-Test Preset Workflows:
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-lime-500/10 dark:bg-zinc-900 dark:hover:bg-lime-500/10 border border-zinc-200 hover:border-lime-500/50 dark:border-zinc-800 dark:hover:border-lime-500/50 text-zinc-700 dark:text-zinc-300 hover:text-lime-600 dark:hover:text-lime-400 font-semibold transition-all shadow-sm cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
