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
      { label: 'X',        href: 'https://twitter.com/litedaemon' },
      { label: 'YouTube',  href: 'https://youtube.com/@litedaemon' },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t font-sans text-sm pt-20 pb-16 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 lg:gap-14">

        {/* Column 1: Brand Logo & Clean Copyright */}
        <div className="col-span-2 sm:col-span-1 space-y-4">
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

          <p className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} LiteDaemon, Inc
          </p>
        </div>

        {/* Columns 2-5: Nav Link Columns */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4
              className="text-sm font-semibold tracking-wide"
              style={{ color: 'var(--text-primary)' }}
            >
              {col.title}
            </h4>
            <ul className="space-y-3.5">
              {col.links.map((link) => {
                const isExternal = 'href' in link;

                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={(link as any).href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-normal text-zinc-400 hover:text-[#ccff00] transition-colors"
                      >
                        <span>{link.label}</span>
                      </a>
                    ) : (
                      <Link
                        to={(link as any).to}
                        className="inline-flex items-center gap-1.5 text-sm font-normal text-zinc-400 hover:text-[#ccff00] transition-colors"
                      >
                        <span>{link.label}</span>
                        {'badge' in link && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-sm ml-1"
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
