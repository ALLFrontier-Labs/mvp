import type { ProviderAdapter } from '../types';
import { firecrawlAdapter }      from './firecrawl';
import { firecrawlParseAdapter } from './firecrawl_parse';
import { llamaparseAdapter }     from './llamaparse';
import { jinaAdapter }           from './jina';
import { apifyAdapter }          from './apify';
import { spiderAdapter }         from './spider';
import { tavilyAdapter }         from './tavily';
import { exaAdapter }            from './exa';
import { serperAdapter }         from './serper';
import { browserbaseAdapter }    from './browserbase';
import { steelAdapter }          from './steel';
import { e2bAdapter }            from './e2b';
import { daytonaAdapter }        from './daytona';

const REGISTRY: Record<string, ProviderAdapter> = {
  firecrawl:       firecrawlAdapter,
  firecrawl_parse: firecrawlParseAdapter,
  llamaparse:      llamaparseAdapter,
  jina:            jinaAdapter,
  apify:           apifyAdapter,
  spider:          spiderAdapter,
  tavily:          tavilyAdapter,
  exa:             exaAdapter,
  serper:          serperAdapter,
  browserbase:     browserbaseAdapter,
  steel:           steelAdapter,
  e2b:             e2bAdapter,
  daytona:         daytonaAdapter,
};

export function getAdapter(slug: string): ProviderAdapter {
  const a = REGISTRY[slug];
  if (!a) throw new Error(`No adapter registered for provider: ${slug}`);
  return a;
}
