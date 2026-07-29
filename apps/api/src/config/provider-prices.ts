// config/provider-prices.ts — Provider List-Price Registry & 5% BYOK Gateway Fee Engine
// Standard list prices per provider across all 5 gateway categories (/v1/scrape, /v1/search, /v1/browser, /v1/execute, /v1/document)

export interface ProviderPriceConfig {
  id:           string;
  name:         string;
  category:     'scrape' | 'search' | 'browser' | 'execute' | 'document';
  basePriceUsd: number; // Provider standard list price per request/session
}

export const PROVIDER_PRICES: Record<string, ProviderPriceConfig> = {
  // ── Web Scraping (/v1/scrape) ─────────────────────────────────────────────
  firecrawl:   { id: 'firecrawl',   name: 'Firecrawl',      category: 'scrape',   basePriceUsd: 0.0030 },
  jina:        { id: 'jina',        name: 'Jina AI Reader', category: 'scrape',   basePriceUsd: 0.0010 },
  apify:       { id: 'apify',       name: 'Apify Actors',   category: 'scrape',   basePriceUsd: 0.0050 },
  spider:      { id: 'spider',      name: 'Spider Cloud',   category: 'scrape',   basePriceUsd: 0.0020 },
  scrape_do:   { id: 'scrape_do',   name: 'Scrape.do',      category: 'scrape',   basePriceUsd: 0.0020 },
  scrapingbee: { id: 'scrapingbee', name: 'ScrapingBee',    category: 'scrape',   basePriceUsd: 0.0030 },
  zenrows:     { id: 'zenrows',     name: 'ZenRows',        category: 'scrape',   basePriceUsd: 0.0030 },
  scraperapi:  { id: 'scraperapi',  name: 'ScraperAPI',     category: 'scrape',   basePriceUsd: 0.0030 },
  scrapfly:    { id: 'scrapfly',    name: 'Scrapfly',       category: 'scrape',   basePriceUsd: 0.0030 },
  crawl4ai:    { id: 'crawl4ai',    name: 'Crawl4AI',       category: 'scrape',   basePriceUsd: 0.0010 },
  brightdata:  { id: 'brightdata',  name: 'BrightData',     category: 'scrape',   basePriceUsd: 0.0040 },

  // ── Real-Time Search (/v1/search) ──────────────────────────────────────────
  tavily:      { id: 'tavily',      name: 'Tavily Search',  category: 'search',   basePriceUsd: 0.0010 },
  exa:         { id: 'exa',         name: 'Exa AI Search',  category: 'search',   basePriceUsd: 0.0020 },
  serper:      { id: 'serper',      name: 'Serper.dev',     category: 'search',   basePriceUsd: 0.0010 },
  perplexity:  { id: 'perplexity',  name: 'Perplexity Search', category: 'search',basePriceUsd: 0.0050 },
  google_search: { id: 'google_search', name: 'Google Search', category: 'search', basePriceUsd: 0.0010 },
  bing_search:   { id: 'bing_search',   name: 'Bing Search',   category: 'search', basePriceUsd: 0.0010 },

  // ── Cloud Browsers & Compute (/v1/browser) ────────────────────────────────
  browserbase: { id: 'browserbase', name: 'Browserbase',    category: 'browser',  basePriceUsd: 0.0150 },
  steel:       { id: 'steel',       name: 'Steel Browser',  category: 'browser',  basePriceUsd: 0.0150 },
  hyperbeam:   { id: 'hyperbeam',   name: 'Hyperbeam',      category: 'browser',  basePriceUsd: 0.0150 },

  // ── Code Execution Sandboxes (/v1/execute) ────────────────────────────────
  e2b:         { id: 'e2b',         name: 'E2B Sandbox',    category: 'execute',  basePriceUsd: 0.0080 },
  daytona:     { id: 'daytona',     name: 'Daytona',        category: 'execute',  basePriceUsd: 0.0080 },
  modal:       { id: 'modal',       name: 'Modal Compute',  category: 'execute',  basePriceUsd: 0.0100 },

  // ── Document Parsing (/v1/document) ────────────────────────────────────────
  llamaparse:  { id: 'llamaparse',  name: 'LlamaParse',     category: 'document', basePriceUsd: 0.0050 },
  unstructured: { id: 'unstructured', name: 'Unstructured',  category: 'document', basePriceUsd: 0.0040 },
  deepdata:    { id: 'deepdata',    name: 'DeepData',       category: 'document', basePriceUsd: 0.0040 },
};

// Default fallback list price if a newly added custom proxy provider isn't explicitly mapped
const DEFAULT_BASE_PRICE_USD = 0.0020;

export function getProviderBasePrice(providerId: string): number {
  const norm = (providerId || '').toLowerCase().trim();
  return PROVIDER_PRICES[norm]?.basePriceUsd ?? DEFAULT_BASE_PRICE_USD;
}

// ── LiteDaemon 5% BYOK Gateway Fee Math ──────────────────────────────────────
// Gateway Fee = exactly 5% (0.05) of the provider's standard base list price
export function calc5PercentFee(providerId: string): number {
  const basePrice = getProviderBasePrice(providerId);
  const fee = basePrice * 0.05;
  return Math.round(fee * 1e8) / 1e8; // Normalized to 8 decimal precision
}
