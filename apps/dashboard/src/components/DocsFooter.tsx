import React from 'react';
import { ExternalLink, Flag } from 'lucide-react';

export const DocsFooter: React.FC = () => {
  return (
    <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
      <div className="flex items-center gap-6">
        <a
          href="https://github.com/ALLFrontier-Labs/mvp/edit/main/apps/dashboard/src/pages/Docs.tsx"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors"
        >
          <span>Edit page on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href="https://github.com/ALLFrontier-Labs/mvp/issues/new"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-lime-500 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report an issue</span>
        </a>
      </div>
    </footer>
  );
};
