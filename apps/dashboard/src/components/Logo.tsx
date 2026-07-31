import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center group">
      <svg
        className="w-6 h-6 text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)] transition-transform group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
      <span className="font-bold text-white tracking-tight text-lg ml-2 font-sans">
        LiteDaemon
      </span>
    </Link>
  );
};
