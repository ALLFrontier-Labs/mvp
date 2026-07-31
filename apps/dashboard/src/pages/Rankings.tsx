import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Clock, DollarSign, Search, X, Activity, CheckCircle2 } from 'lucide-react';

interface ToolBenchmark {
  rank: number;
  name: string;
  provider: string;
  category: 'Search' | 'Scraping' | 'Code' | 'Browser' | 'Document';
  score: number;
  latency: string;
  p50Latency: string;
  p90Latency: string;
  p99Latency: string;
  uptime: string;
  cost: string;
  failoverHealth: string;
  endpoint: string;
  description: string;
}

const MOCK_RANKINGS: ToolBenchmark[] = [
  { rank: 1, name: 'Tavily Search', provider: 'Tavily', category: 'Search', score: 98.4, latency: '142ms', p50Latency: '120ms', p90Latency: '185ms', p99Latency: '310ms', uptime: '99.99%', cost: '$0.001/call', failoverHealth: '100%', endpoint: '/v1/search', description: 'Real-time AI optimized search API built specifically for LLM agents.' },
  { rank: 2, name: 'Exa Neural Search', provider: 'Exa', category: 'Search', score: 96.1, latency: '198ms', p50Latency: '175ms', p90Latency: '240ms', p99Latency: '420ms', uptime: '99.95%', cost: '$0.002/call', failoverHealth: '99.8%', endpoint: '/v1/search', description: 'Embeddings-based semantic neural web search for high-density document retrieval.' },
  { rank: 3, name: 'Firecrawl Scrape Engine', provider: 'Firecrawl', category: 'Scraping', score: 95.7, latency: '320ms', p50Latency: '280ms', p90Latency: '450ms', p99Latency: '890ms', uptime: '99.90%', cost: '$0.003/call', failoverHealth: '99.5%', endpoint: '/v1/scrape', description: 'Turn any complex JS website into clean, LLM-ready markdown in seconds.' },
  { rank: 4, name: 'E2B Code Sandbox', provider: 'E2B', category: 'Code', score: 94.3, latency: '890ms', p50Latency: '750ms', p90Latency: '1.2s', p99Latency: '2.1s', uptime: '99.85%', cost: '$0.005/call', failoverHealth: '99.9%', endpoint: '/v1/execute', description: 'Secure Firecracker microVM sandboxes for executing arbitrary Python and JS code.' },
  { rank: 5, name: 'Browserbase Headless', provider: 'Browserbase', category: 'Browser', score: 93.8, latency: '1.2s', p50Latency: '1.1s', p90Latency: '1.8s', p99Latency: '3.2s', uptime: '99.80%', cost: '$0.008/call', failoverHealth: '99.2%', endpoint: '/v1/browser', description: 'Developer-first headless browser infrastructure in the cloud with captcha solving.' },
  { rank: 6, name: 'Serper Google Search', provider: 'Serper', category: 'Search', score: 92.1, latency: '210ms', p50Latency: '190ms', p90Latency: '290ms', p99Latency: '510ms', uptime: '99.75%', cost: '$0.001/call', failoverHealth: '99.7%', endpoint: '/v1/search', description: 'Fast, structured Google Search results API with knowledge graph integration.' },
  { rank: 7, name: 'Jina Reader API', provider: 'Jina', category: 'Scraping', score: 90.5, latency: '410ms', p50Latency: '360ms', p90Latency: '580ms', p99Latency: '1.1s', uptime: '99.65%', cost: '$0.002/call', failoverHealth: '99.1%', endpoint: '/v1/scrape', description: 'Zero-config URL to Markdown parser with built-in prompt optimization.' },
  { rank: 8, name: 'Steel Browser Cloud', provider: 'Steel', category: 'Browser', score: 89.3, latency: '1.5s', p50Latency: '1.3s', p90Latency: '2.1s', p99Latency: '4.0s', uptime: '99.60%', cost: '$0.009/call', failoverHealth: '98.9%', endpoint: '/v1/browser', description: 'Open-source browser automation platform for complex multi-step web agents.' },
  { rank: 9, name: 'LlamaParse Doc Parser', provider: 'LlamaIndex', category: 'Document', score: 91.8, latency: '1.8s', p50Latency: '1.5s', p90Latency: '2.9s', p99Latency: '5.2s', uptime: '99.88%', cost: '$0.004/call', failoverHealth: '99.6%', endpoint: '/v1/parse', description: 'GenAI document parsing for complex PDF tables, charts, and spatial layouts.' },
];

const SORT_OPTIONS = ['Score', 'Latency', 'Uptime', 'Cost'] as const;
const CATEGORY_OPTIONS = ['All', 'Search', 'Scraping', 'Code', 'Browser', 'Document'] as const;

export const Rankings: React.FC = () => {
  const [sort, setSort] = useState<typeof SORT_OPTIONS[number]>('Score');
  const [category, setCategory] = useState<typeof CATEGORY_OPTIONS[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolBenchmark | null>(null);

  const filteredRankings = MOCK_RANKINGS
    .filter(item => category === 'All' || item.category === category)
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.provider.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'Score') return b.score - a.score;
      if (sort === 'Latency') return parseFloat(a.latency) - parseFloat(b.latency);
      if (sort === 'Uptime') return parseFloat(b.uptime) - parseFloat(a.uptime);
      if (sort === 'Cost') return parseFloat(a.cost.replace('$', '')) - parseFloat(b.cost.replace('$', ''));
      return 0;
    });

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Rankings</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Tool Performance Benchmarks
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Live latency, uptime SLA, and throughput rankings across all 150+ tool engines, updated hourly.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Search + Category + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs w-full md:w-72"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tools or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 outline-none text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border text-xs font-medium overflow-x-auto"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                  style={
                    category === cat
                      ? { backgroundColor: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 600 }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border text-xs font-medium"
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
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
          {/* Table Head */}
          <div
            className="grid grid-cols-8 gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider border-b"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <span>#</span>
            <span className="col-span-2">Tool Engine</span>
            <span>Category</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Score</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Uptime</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
          </div>

          {filteredRankings.length === 0 ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No tool engines matched your query.
            </div>
          ) : (
            filteredRankings.map((row, i) => (
              <div
                key={row.name}
                onClick={() => setSelectedTool(row)}
                className="grid grid-cols-8 gap-4 px-5 py-3.5 text-xs border-b transition-colors cursor-pointer items-center"
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
                  {i + 1}
                </span>
                <span className="col-span-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {row.name}
                  <span className="ml-1.5 text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                    by {row.provider}
                  </span>
                </span>
                <span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    {row.category}
                  </span>
                </span>
                <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{row.score}</span>
                <span className="font-mono">{row.latency}</span>
                <span className="font-mono text-emerald-400 font-semibold">{row.uptime}</span>
                <span className="font-mono">{row.cost}</span>
              </div>
            ))
          )}
        </div>

        <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          Click any row to inspect 50p/90p/99p latency distributions, failover health scores, and sample endpoints.
        </p>
      </div>

      {/* Benchmark Detail Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg rounded-2xl border p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <button 
              onClick={() => setSelectedTool(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {selectedTool.category}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {selectedTool.endpoint}
                </span>
              </div>
              <h2 className="text-xl font-bold">{selectedTool.name}</h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selectedTool.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Score</span>
                <div className="text-lg font-mono font-bold" style={{ color: 'var(--accent)' }}>{selectedTool.score}</div>
              </div>
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Uptime SLA</span>
                <div className="text-lg font-mono font-bold text-emerald-400">{selectedTool.uptime}</div>
              </div>
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Cost</span>
                <div className="text-lg font-mono font-bold">{selectedTool.cost}</div>
              </div>
            </div>

            {/* Latency Percentiles */}
            <div className="space-y-2">
              <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Latency Percentile Distribution
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>p50</div>
                  <div className="font-semibold mt-0.5">{selectedTool.p50Latency}</div>
                </div>
                <div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>p90</div>
                  <div className="font-semibold mt-0.5">{selectedTool.p90Latency}</div>
                </div>
                <div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>p99</div>
                  <div className="font-semibold mt-0.5 text-amber-400">{selectedTool.p99Latency}</div>
                </div>
              </div>
            </div>

            {/* Failover & BYOK Status */}
            <div className="flex items-center justify-between p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>BYOK Multi-Key Auto Failover</span>
              </div>
              <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                {selectedTool.failoverHealth} Health
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
