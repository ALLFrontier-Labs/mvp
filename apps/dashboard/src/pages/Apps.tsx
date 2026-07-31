import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Star, Users, Zap } from 'lucide-react';

const FEATURED_APPS = [
  {
    name: 'ResearchBot',
    description: 'Autonomous research agent that searches, scrapes, and summarises web content into structured reports.',
    tags: ['LangChain', 'Tavily', 'Firecrawl'],
    stars: 1240,
    author: 'community',
    url: 'https://github.com',
    color: 'from-indigo-600/20 to-indigo-900/5',
  },
  {
    name: 'CodeInterpreter',
    description: 'Run Python in an E2B sandbox from your AI agent. Full filesystem, internet access, and package support.',
    tags: ['CrewAI', 'E2B', 'Python'],
    stars: 987,
    author: 'community',
    url: 'https://github.com',
    color: 'from-amber-600/20 to-amber-900/5',
  },
  {
    name: 'WebPilot',
    description: 'Browser automation agent that navigates, fills forms, and extracts data from any website autonomously.',
    tags: ['AutoGen', 'Browserbase', 'Steel'],
    stars: 834,
    author: 'community',
    url: 'https://github.com',
    color: 'from-purple-600/20 to-purple-900/5',
  },
  {
    name: 'LeadEnricher',
    description: 'B2B lead enrichment pipeline. Takes a company name, finds contacts, enriches with web data.',
    tags: ['n8n', 'Exa', 'Serper'],
    stars: 712,
    author: 'community',
    url: 'https://github.com',
    color: 'from-emerald-600/20 to-emerald-900/5',
  },
  {
    name: 'DocParser Pro',
    description: 'Upload PDFs, DOCXs, and images — get structured JSON output with LlamaParse + GPT-4o.',
    tags: ['LlamaIndex', 'LlamaParse', 'TypeScript'],
    stars: 623,
    author: 'community',
    url: 'https://github.com',
    color: 'from-rose-600/20 to-rose-900/5',
  },
  {
    name: 'NewsDigest',
    description: 'Daily AI newsletter agent. Searches for trending stories, summarises, and sends via email.',
    tags: ['Python', 'Tavily', 'Exa'],
    stars: 541,
    author: 'community',
    url: 'https://github.com',
    color: 'from-cyan-600/20 to-cyan-900/5',
  },
];

export const Apps: React.FC = () => {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Apps</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Apps Built on LiteDaemon
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Open-source agents, bots, and workflows built by the community using the LiteDaemon gateway.
              </p>
            </div>
            <a
              href="https://github.com/ALLFrontier-Labs/mvp"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              Submit Your App
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-3 gap-4 p-4 rounded-2xl border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {[
            { icon: <Users className="w-4 h-4" />, value: '12,000+', label: 'Active Builders' },
            { icon: <Zap className="w-4 h-4" />,   value: '500+',    label: 'Shipped Apps' },
            { icon: <Star className="w-4 h-4" />,  value: '28K+',    label: 'GitHub Stars Combined' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div style={{ color: '#ccff00' }}>{stat.icon}</div>
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_APPS.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col justify-between p-5 rounded-2xl border overflow-hidden transition-all hover:scale-[1.01]"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              {/* Gradient accent bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-40 pointer-events-none`} />

              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {app.name}
                  </h3>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {app.description}
                </p>
              </div>

              <div className="relative mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {app.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono border"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <Star className="w-3 h-3" />
                  <span>{app.stars.toLocaleString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
