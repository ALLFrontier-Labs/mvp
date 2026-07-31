import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Tools',      to: '/providers' },
      { label: 'Playground', to: '/playground' },
      { label: 'Rankings',   to: '/rankings' },
      { label: 'Apps',       to: '/apps' },
      { label: 'Discover',   to: '/providers' },
      { label: 'Pricing',    to: '/billing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',            to: '/about' },
      { label: 'Blog',             to: '/blog' },
      { label: 'Careers',          to: '/careers', badge: 'Hiring' },
      { label: 'Privacy',          to: '/privacy' },
      { label: 'Terms of Service',  to: '/terms' },
      { label: 'Support',          to: '/support' },
    ],
  },
  {
    title: 'Developer',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'API Reference', to: '/docs/api' },
      { label: 'SDKs',          to: '/docs/sdks' },
      { label: 'Status',       href: 'https://status.litedaemon.com' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Discord',  href: 'https://discord.gg/litedaemon' },
      { label: 'GitHub',   href: 'https://github.com/ALLFrontier-Labs/mvp' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/litedaemon' },
      { label: 'X / Twitter', href: 'https://twitter.com/litedaemon' },
      { label: 'YouTube',  href: 'https://youtube.com/@litedaemon' },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t font-sans text-xs pt-16 pb-12 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">

        {/* Column 1: Brand Logo & Clean Copyright */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: '#ccff00' }}
            >
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            </svg>
            <span
              className="font-bold tracking-tight text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              LiteDaemon
            </span>
          </Link>

          <p className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} LiteDaemon, Inc.
          </p>
        </div>

        {/* Columns 2-5: Nav Link Columns */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3.5">
            <h4
              className="text-xs font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => {
                const isExternal = 'href' in link;

                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={(link as any).href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-100"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span>{link.label}</span>
                      </a>
                    ) : (
                      <Link
                        to={(link as any).to}
                        className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-100"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span>{link.label}</span>
                        {'badge' in link && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                            }}
                          >
                            {(link as any).badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      </div>
    </footer>
  );
};
