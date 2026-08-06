import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export const BackgroundCanvas: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Dot-Grid Pattern Layer */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 dark:opacity-30" />

      {/* 2. Interactive Ambient Radial Mesh Aura */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isDark
            ? `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(163, 230, 53, 0.04), transparent 80%),
               radial-gradient(800px circle at 80% 20%, rgba(16, 185, 129, 0.03), transparent 70%),
               radial-gradient(1000px circle at 20% 80%, rgba(99, 102, 241, 0.03), transparent 80%)`
            : `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(101, 163, 13, 0.05), transparent 80%),
               radial-gradient(800px circle at 80% 20%, rgba(5, 150, 105, 0.04), transparent 70%)`,
        }}
      />

      {/* 3. Top Architectural Noise Grid Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-lime-500/20 dark:via-lime-400/20 to-transparent" />
    </div>
  );
};
