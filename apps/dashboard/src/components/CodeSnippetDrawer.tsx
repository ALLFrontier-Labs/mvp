import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Copy, Check, Terminal, Code2, ExternalLink,
  ShieldCheck, Zap, Layers, Sparkles
} from 'lucide-react';
import { PROVIDER_META, ENDPOINT_BADGE } from '../data/providers';
import { getStoredApiKey } from '../lib/api';

export interface CodeSnippetDrawerProps {
  isOpen: boolean;
  provider: {
    id: string;
    name: string;
    endpoint: string;
    adapter_type?: string;
  } | null;
  onClose: () => void;
}

export const CodeSnippetDrawer: React.FC<CodeSnippetDrawerProps> = ({
  isOpen,
  provider,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copied, setCopied]       = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab on provider change
  useEffect(() => {
    setActiveTab('curl');
    setCopied(false);
  }, [provider]);

  if (!isOpen || !provider) return null;

  const apiKey = getStoredApiKey() || 'YOUR_LITEDAEMON_KEY';
  const meta = PROVIDER_META[provider.id] || {
    website: 'https://litedaemon.com',
    latency: '~450ms',
    sampleParams: { url: 'https://example.com' }
  };

  const endpointPath = provider.endpoint.startsWith('/') ? provider.endpoint : `/${provider.endpoint}`;
  const providerKeyPlaceholder = `YOUR_${provider.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_KEY`;

  const generateSnippet = () => {
    const samplePayload = {
      provider: provider.id,
      params: meta.sampleParams || { url: 'https://example.com' }
    };

    if (activeTab === 'curl') {
      return `curl -X POST "https://api.litedaemon.com${endpointPath}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "X-Provider-Key: ${providerKeyPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;
    }

    if (activeTab === 'typescript') {
      return `import { LiteDaemon } from '@litedaemon/sdk';

// Initialize LiteDaemon client with your master key
const client = new LiteDaemon({ apiKey: '${apiKey}' });

// Execute request with BYOK provider key header
const response = await client.execute({
  endpoint: '${endpointPath}',
  provider: '${provider.id}',
  headers: {
    'X-Provider-Key': '${providerKeyPlaceholder}'
  },
  params: ${JSON.stringify(meta.sampleParams || { url: 'https://example.com' }, null, 2)}
});

console.log('Result:', response.data);`;
    }

    if (activeTab === 'python') {
      return `import httpx
import asyncio

async function main():
    url = "https://api.litedaemon.com${endpointPath}"
    headers = {
        "Authorization": "Bearer ${apiKey}",
        "X-Provider-Key": "${providerKeyPlaceholder}",
        "Content-Type": "application/json"
    }
    payload = ${JSON.stringify(samplePayload, null, 4)}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        print("Status:", response.status_code)
        print("Response:", response.json())

if __name__ == "__main__":
    asyncio.run(main())`;
    }

    return '';
  };

  const handleCopy = () => {
    const code = generateSnippet();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-Over Panel */}
      <div className="fixed top-0 right-0 z-[9999] h-screen w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out font-sans">
        
        {/* Drawer Header Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 shrink-0 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
                  {provider.name}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${ENDPOINT_BADGE[provider.endpoint] || 'bg-zinc-100 text-zinc-700'}`}>
                  {provider.endpoint}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  BYOK Direct
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <span>Native Proxy Adapter</span>
                <span>·</span>
                <a
                  href={meta.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1"
                >
                  <span>Provider Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Language Tabs & Code Display */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          
          {/* Language Selector Buttons */}
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'curl'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                cURL CLI
              </button>
              <button
                onClick={() => setActiveTab('typescript')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'typescript'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                TypeScript / Node.js
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'python'
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Python (Async)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-200 hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-lime-400" />}
              <span>{copied ? '✓ Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax Highlighted Code Container */}
          <div className="relative group">
            <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
              {generateSnippet()}
            </pre>
          </div>

          {/* Key Routing Note */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>AES-256-GCM BYOK Vault Authentication</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed font-sans">
              Pass your encrypted provider API key in the <code className="text-lime-600 dark:text-lime-400 font-mono">X-Provider-Key</code> header or configure primary/fallback keys in your BYOK Vault for automated zero-downtime rotation.
            </p>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 flex justify-between items-center text-xs font-mono shrink-0">
          <span className="text-zinc-500">LiteDaemon Code Engine v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </>,
    document.body
  );
};
