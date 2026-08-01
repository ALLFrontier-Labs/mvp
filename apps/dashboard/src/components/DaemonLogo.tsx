'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface DaemonLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function DaemonLogo({ size = 28, className = '', showText = true }: DaemonLogoProps) {
  let isLight = false;

  try {
    const { resolvedTheme } = useTheme();
    isLight = resolvedTheme === 'light';
  } catch {
    // Fallback if rendered outside ThemeProvider
    if (typeof document !== 'undefined') {
      isLight = document.documentElement.classList.contains('light');
    }
  }

  // Dynamic Theme Colors
  const stopColor1 = isLight ? '#0284c7' : '#22d3ee';
  const stopColor2 = isLight ? '#6366f1' : '#818cf8';
  const stopColor3 = isLight ? '#4f46e5' : '#e0e7ff';

  const filterGlow = isLight
    ? 'drop-shadow(0 2px 5px rgba(15,23,42,0.15))'
    : 'drop-shadow(0 0 8px rgba(34,211,238,0.55))';

  const eyeFill = isLight ? '#0f172a' : '#ffffff';
  const textLiteColor = isLight ? 'text-zinc-900' : 'text-zinc-100';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon with Theme-Adaptive Glow */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: filterGlow }}
          className="transition-all duration-300 transform group-hover:scale-105"
        >
          <defs>
            {/* Dynamic Linear Gradient */}
            <linearGradient id="daemonGradient" x1="10%" y1="90%" x2="90%" y2="10%">
              <stop offset="0%" stopColor={stopColor1} />
              <stop offset="50%" stopColor={stopColor2} />
              <stop offset="100%" stopColor={stopColor3} />
            </linearGradient>
          </defs>

          {/* Outer Daemon Head Contour Line */}
          <path
            d="M 50 83 
               L 26 71 
               L 20 46 
               L 22 28 
               L 36 34 
               L 50 25 
               L 64 34 
               L 78 28 
               L 80 46 
               L 74 71 
               Z"
            stroke="url(#daemonGradient)"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Eye */}
          <polygon
            points="29,54 43,62 31,65"
            fill={eyeFill}
            className="transition-colors duration-300"
          />

          {/* Right Eye */}
          <polygon
            points="71,54 57,62 69,65"
            fill={eyeFill}
            className="transition-colors duration-300"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`font-bold text-lg tracking-tight ${textLiteColor} transition-colors duration-200`}>
          Lite<span className="text-lime-400 dark:text-lime-400 light:text-lime-600">Daemon</span>
        </span>
      )}
    </div>
  );
}
