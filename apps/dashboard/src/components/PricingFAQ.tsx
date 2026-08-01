import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    q: 'How does the BYOK micro-routing fee work?',
    a: 'On LiteDaemon, you bring your own provider API keys (Tavily, Firecrawl, E2B, Steel, Exa, etc.). We charge a flat 5% routing fee (or fixed monthly Pro/Enterprise subscription) to manage key encryption, rate-limiting, and instant failover redundancy.',
  },
  {
    id: 'faq-2',
    q: 'Do I pay LiteDaemon or the underlying provider for usage?',
    a: 'You pay the underlying provider directly for raw API requests using your own keys. LiteDaemon only meters the lightweight routing execution fee, saving you up to 65% compared to closed API wrappers.',
  },
  {
    id: 'faq-3',
    q: 'What happens if one of my provider keys hits a quota limit?',
    a: "LiteDaemon's failover engine detects the HTTP 429/402 response and automatically routes the request to your backup key or secondary provider in under 12ms.",
  },
  {
    id: 'faq-4',
    q: 'Are my provider keys safe in LiteDaemon\'s Vault?',
    a: 'Absolutely. Your provider keys are encrypted client-side using AES-256-GCM before storage and are decrypted strictly in ephemeral runtime memory for active requests.',
  },
  {
    id: 'faq-5',
    q: 'Can I upgrade, downgrade, or cancel at any time?',
    a: 'Yes. You can change your tier or top up your prepaid wallet balance at any time directly from your Account Settings panel.',
  },
];

export const PricingFAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans selection:bg-lime-400 selection:text-zinc-950">
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-lime-500" />
          <span>Frequently Asked Questions</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Everything you need to know about BYOK key routing, micro-fees, and security.
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full p-4 text-left font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-lime-500' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 font-sans text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
