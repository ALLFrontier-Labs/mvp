import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group shrink-0">
      <svg
        className="w-5 h-5 transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: '#ccff00' }}
        aria-hidden="true"
      >
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
      <span
        className="font-bold tracking-tight text-base font-sans"
        style={{ color: 'var(--text-primary)' }}
      >
        LiteDaemon
      </span>
    </Link>
  );
};
