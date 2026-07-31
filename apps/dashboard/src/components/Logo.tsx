import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <Zap className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <span className="text-white font-bold tracking-tight text-lg font-sans">
        LiteDaemon
      </span>
    </Link>
  );
};
