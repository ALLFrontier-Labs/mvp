import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Tools',      to: '/providers' },
    { label: 'Playground', to: '/playground' },
    { label: 'Rankings',   to: '/rankings' },
    { label: 'Apps',       to: '/apps' },
    { label: 'Pricing',    to: '/billing' },
    { label: 'Changelog',  to: '/docs/changelog' },
  ],
  Company: [
    { label: 'About',          to: '/about' },
    { label: 'Blog',           to: '/blog' },
    { label: 'Careers',        to: '/careers' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Status',         href: 'https://status.litedaemon.com' },
  ],
  Developers: [
    { label: 'Documentation',  to: '/docs' },
    { label: 'API Reference',  to: '/docs/api' },
    { label: 'SDKs & Tools',   to: '/docs/sdks' },
    { label: 'Discord',        href: 'https://discord.gg/litedaemon' },
    { label: 'GitHub',         href: 'https://github.com/ALLFrontier-Labs/mvp' },
    { label: 'X / Twitter',    href: 'https://twitter.com/litedaemon' },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t font-sans text-xs"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="space-y-5">
          {/* Logo */}
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

          {/* Status pill */}
          <a
            href="https://status.litedaemon.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono hover:opacity-80 transition-opacity w-fit"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: '#22c55e',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            All systems operational
          </a>

          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} LiteDaemon, Inc.
            <br />All rights reserved.
          </p>
        </div>

        {/* Link Columns */}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section} className="space-y-4">
            <h4
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-primary)' }}
            >
              {section}
            </h4>
            <ul className="space-y-2.5">
              {links.map((link) => {
                const isExternal = 'href' in link;
                const sharedClass =
                  'inline-flex items-center gap-1 transition-colors hover:opacity-100';

                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={(link as any).href}
                        target="_blank"
                        rel="noreferrer"
                        className={sharedClass}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={(link as any).to}
                        className={sharedClass}
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.color = 'var(--text-primary)')
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.color = 'var(--text-muted)')
                        }
                      >
                        {link.label}
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
