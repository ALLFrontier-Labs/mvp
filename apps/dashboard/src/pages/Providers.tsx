import React, { useState } from 'react';
import { Layers, Copy, Check, ExternalLink, Zap, ShieldCheck } from 'lucide-react';

interface ProviderCard {
  id: string;
  name: string;
  endpoint: string;
  response_type: 'sync' | 'async';
  cost_per_call: string;
  description: string;
  website: string;
}

const PROVIDERS: ProviderCard[] = [
  // Scrape
  { id: 'firecrawl', name: 'Firecrawl', endpoint: '/v1/scrape', response_type: 'sync', cost_per_call: '$0.0030', description: 'Turn any web page into LLM-ready markdown clean text.', website: 'https://firecrawl.dev' },
  { id: 'jina', name: 'Jina AI Reader', endpoint: '/v1/scrape', response_type: 'sync', cost_per_call: '$0.0010', description: 'Blazing fast LLM web reader & markdown extractor.', website: 'https://jina.ai' },
  { id: 'apify', name: 'Apify Actors', endpoint: '/v1/scrape', response_type: 'async', cost_per_call: '$0.0100', description: 'Async actor execution for complex multi-page scraping.', website: 'https://apify.com' },
  { id: 'spider', name: 'Spider Cloud', endpoint: '/v1/scrape', response_type: 'sync', cost_per_call: '$0.0020', description: 'High-concurrency cloud crawler & scraper API.', website: 'https://spider.cloud' },

  // Search
  { id: 'tavily', name: 'Tavily Search', endpoint: '/v1/search', response_type: 'sync', cost_per_call: '$0.0010', description: 'Search engine optimized for AI agents and RAG.', website: 'https://tavily.com' },
  { id: 'exa', name: 'Exa AI', endpoint: '/v1/search', response_type: 'sync', cost_per_call: '$0.0020', description: 'Neural web search by embeddings & semantic similarity.', website: 'https://exa.ai' },
  { id: 'serper', name: 'Serper.dev', endpoint: '/v1/search', response_type: 'sync', cost_per_call: '$0.0010', description: 'Real-time Google SERP search results API.', website: 'https://serper.dev' },

  // Browser
  { id: 'browserbase', name: 'Browserbase', endpoint: '/v1/browser', response_type: 'sync', cost_per_call: '$0.0150', description: 'Headless Chrome browser sessions in the cloud with CDP.', website: 'https://browserbase.com' },
  { id: 'steel', name: 'Steel Browser', endpoint: '/v1/browser', response_type: 'sync', cost_per_call: '$0.0150', description: 'Anti-detect cloud browser infrastructure with captcha solving.', website: 'https://steel.dev' },

  // Execute
  { id: 'e2b', name: 'E2B Sandbox', endpoint: '/v1/execute', response_type: 'sync', cost_per_call: '$0.0030', description: 'Secure isolated Python/JS code execution environment for AI.', website: 'https://e2b.dev' },
];

export const Providers: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groups = [
    { title: 'Scraping & Web Parsing', endpoint: '/v1/scrape', color: 'text-emerald-400' },
    { title: 'AI & Web Search', endpoint: '/v1/search', color: 'text-teal-400' },
    { title: 'Cloud Headless Browsers', endpoint: '/v1/browser', color: 'text-cyan-400' },
    { title: 'Code Sandboxes', endpoint: '/v1/execute', color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Markup Guarantee</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          V1 Provider Catalog — 10 Unified Adapters
        </h1>
        <p className="text-slate-400 text-base">
          Zero markup — you pay exactly what we pay. One prepaid wallet covers every upstream tool.
        </p>
      </div>

      {/* Provider Groups */}
      <div className="space-y-12">
        {groups.map((group) => {
          const items = PROVIDERS.filter((p) => p.endpoint === group.endpoint);

          return (
            <div key={group.endpoint} className="space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <span className={`font-mono text-sm font-bold uppercase ${group.color}`}>
                  {group.endpoint}
                </span>
                <h2 className="text-lg font-bold text-white">{group.title}</h2>
                <span className="text-xs text-slate-500 font-mono">({items.length} providers)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl glass-card border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                            {p.name}
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-slate-300"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => handleCopy(p.id)}
                              className="text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
                              title="Copy provider ID"
                            >
                              <span>id: {p.id}</span>
                              {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            </button>
                          </div>
                        </div>

                        {/* Response Type Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            p.response_type === 'async'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {p.response_type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">Wholesale Cost:</span>
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {p.cost_per_call} <span className="text-[10px] text-slate-500 font-normal">/ call</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
