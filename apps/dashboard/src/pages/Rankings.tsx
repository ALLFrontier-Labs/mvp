import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Clock, DollarSign, ArrowUpRight } from 'lucide-react';

const MOCK_RANKINGS = [
  { rank: 1,  name: 'Tavily Search',    provider: 'Tavily',      category: 'Search',      score: 98.4, latency: '142ms', uptime: '99.9%', cost: '$0.001/call' },
  { rank: 2,  name: 'Exa Search',       provider: 'Exa',         category: 'Search',      score: 96.1, latency: '198ms', uptime: '99.8%', cost: '$0.002/call' },
  { rank: 3,  name: 'Firecrawl Scrape', provider: 'Firecrawl',   category: 'Scraping',    score: 95.7, latency: '320ms', uptime: '99.7%', cost: '$0.003/call' },
  { rank: 4,  name: 'E2B Sandbox',      provider: 'E2B',         category: 'Code',        score: 94.3, latency: '890ms', uptime: '99.6%', cost: '$0.005/call' },
  { rank: 5,  name: 'Browserbase',      provider: 'Browserbase', category: 'Browser',     score: 93.8, latency: '1.2s',  uptime: '99.5%', cost: '$0.008/call' },
  { rank: 6,  name: 'Serper Search',    provider: 'Serper',      category: 'Search',      score: 92.1, latency: '210ms', uptime: '99.4%', cost: '$0.001/call' },
  { rank: 7,  name: 'Jina Reader',      provider: 'Jina',        category: 'Scraping',    score: 90.5, latency: '410ms', uptime: '99.2%', cost: '$0.002/call' },
  { rank: 8,  name: 'Steel Browser',    provider: 'Steel',       category: 'Browser',     score: 89.3, latency: '1.5s',  uptime: '99.1%', cost: '$0.009/call' },
];

const SORT_OPTIONS = ['Score', 'Latency', 'Uptime', 'Cost'] as const;

export const Rankings: React.FC = () => {
  const [sort, setSort] = React.useState<typeof SORT_OPTIONS[number]>('Score');

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Rankings</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Tool Rankings
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Live performance rankings across all 150+ tool engines, updated hourly.
              </p>
            </div>
          </div>
        </div>

        {/* Sort Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border w-fit text-xs font-medium"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              style={
                sort === opt
                  ? { backgroundColor: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 600 }
                  : { color: 'var(--text-muted)' }
              }
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {/* Table Head */}
          <div
            className="grid grid-cols-8 gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider border-b"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <span>#</span>
            <span className="col-span-2">Tool</span>
            <span>Category</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Score</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Uptime</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
          </div>

          {MOCK_RANKINGS.map((row, i) => (
            <div
              key={row.rank}
              className="grid grid-cols-8 gap-4 px-4 py-3 text-xs border-b transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)')}
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)')
              }
            >
              <span className="font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                {row.rank}
              </span>
              <span className="col-span-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                {row.name}
                <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {row.provider}
                </span>
              </span>
              <span>{row.category}</span>
              <span className="font-mono font-semibold text-emerald-400">{row.score}</span>
              <span className="font-mono">{row.latency}</span>
              <span className="font-mono">{row.uptime}</span>
              <span className="font-mono">{row.cost}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          Scores computed from latency, uptime, throughput, and accuracy benchmarks across 30-day rolling window.
        </p>
      </div>
    </div>
  );
};
