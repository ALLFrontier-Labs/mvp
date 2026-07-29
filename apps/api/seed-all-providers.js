// seed-all-providers.js — Seed all 36 production adapters into providers table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PROVIDERS = [
  // ── Web Scraping (/v1/scrape) ─────────────────────────────────────────────
  { id: 'firecrawl',     name: 'Firecrawl',                endpoint: 'scrape',   adapter: 'firecrawl',   type: 'sync',  cost: 0.003 },
  { id: 'jina',          name: 'Jina AI Reader',           endpoint: 'scrape',   adapter: 'jina',        type: 'sync',  cost: 0.001 },
  { id: 'apify',         name: 'Apify Actors',             endpoint: 'scrape',   adapter: 'apify',       type: 'async', cost: 0.010 },
  { id: 'spider',        name: 'Spider Cloud',             endpoint: 'scrape',   adapter: 'spider',      type: 'sync',  cost: 0.002 },
  { id: 'scrape_do',     name: 'Scrape.do',                endpoint: 'scrape',   adapter: 'scrape_do',   type: 'sync',  cost: 0.002 },
  { id: 'scrapingbee',   name: 'ScrapingBee',              endpoint: 'scrape',   adapter: 'scrapingbee', type: 'sync',  cost: 0.003 },
  { id: 'zenrows',       name: 'ZenRows',                  endpoint: 'scrape',   adapter: 'zenrows',     type: 'sync',  cost: 0.003 },
  { id: 'scraperapi',    name: 'ScraperAPI',               endpoint: 'scrape',   adapter: 'scraperapi',  type: 'sync',  cost: 0.002 },
  { id: 'scrapfly',      name: 'Scrapfly',                 endpoint: 'scrape',   adapter: 'scrapfly',    type: 'sync',  cost: 0.003 },
  { id: 'crawl4ai',      name: 'Crawl4AI',                 endpoint: 'scrape',   adapter: 'crawl4ai',    type: 'sync',  cost: 0.001 },
  { id: 'brightdata',    name: 'BrightData Web Scraper',   endpoint: 'scrape',   adapter: 'brightdata',  type: 'sync',  cost: 0.003 },
  { id: 'oxylabs',       name: 'Oxylabs Web Scraper',      endpoint: 'scrape',   adapter: 'oxylabs',     type: 'sync',  cost: 0.003 },

  // ── Web Search (/v1/search) ───────────────────────────────────────────────
  { id: 'tavily',        name: 'Tavily Search',            endpoint: 'search',   adapter: 'tavily',      type: 'sync',  cost: 0.001 },
  { id: 'serper',        name: 'Serper.dev',               endpoint: 'search',   adapter: 'serper',      type: 'sync',  cost: 0.001 },
  { id: 'exa',           name: 'Exa AI',                   endpoint: 'search',   adapter: 'exa',         type: 'sync',  cost: 0.002 },
  { id: 'brave',         name: 'Brave Search',             endpoint: 'search',   adapter: 'brave',       type: 'sync',  cost: 0.001 },
  { id: 'serpapi',       name: 'SerpAPI',                  endpoint: 'search',   adapter: 'serpapi',     type: 'sync',  cost: 0.002 },
  { id: 'bing',          name: 'Bing Search',              endpoint: 'search',   adapter: 'bing',        type: 'sync',  cost: 0.002 },
  { id: 'google_cse',    name: 'Google Custom Search',      endpoint: 'search',   adapter: 'google_cse',  type: 'sync',  cost: 0.002 },
  { id: 'zenserp',       name: 'Zenserp',                  endpoint: 'search',   adapter: 'zenserp',     type: 'sync',  cost: 0.002 },
  { id: 'you',           name: 'You.com API',              endpoint: 'search',   adapter: 'you',         type: 'sync',  cost: 0.002 },
  { id: 'perplexity',    name: 'Perplexity Search',        endpoint: 'search',   adapter: 'perplexity',  type: 'sync',  cost: 0.003 },
  { id: 'searxng',       name: 'SearXNG Open Search',      endpoint: 'search',   adapter: 'searxng',     type: 'sync',  cost: 0.001 },

  // ── Headless Browsers (/v1/browser) ───────────────────────────────────────
  { id: 'browserbase',   name: 'Browserbase',              endpoint: 'browser',  adapter: 'browserbase', type: 'sync',  cost: 0.015 },
  { id: 'steel',         name: 'Steel Browser',            endpoint: 'browser',  adapter: 'steel',       type: 'sync',  cost: 0.015 },
  { id: 'browserless',   name: 'Browserless.io',           endpoint: 'browser',  adapter: 'browserless', type: 'sync',  cost: 0.012 },
  { id: 'anchor',        name: 'Anchor Browser',           endpoint: 'browser',  adapter: 'anchor',      type: 'sync',  cost: 0.015 },

  // ── Document Parsing (/v1/document) ──────────────────────────────────────
  { id: 'llamaparse',      name: 'LlamaParse API',         endpoint: 'document', adapter: 'llamaparse',     type: 'sync', cost: 0.003 },
  { id: 'unstructured',   name: 'Unstructured.io',         endpoint: 'document', adapter: 'unstructured', type: 'sync', cost: 0.004 },
  { id: 'firecrawl_parse',name: 'Firecrawl Document Parse',endpoint: 'document', adapter: 'firecrawl_parse', type: 'sync', cost: 0.005 },
  { id: 'diffbot',        name: 'Diffbot Document',        endpoint: 'document', adapter: 'diffbot',        type: 'sync', cost: 0.004 },

  // ── Execution Sandboxes (/v1/execute) ─────────────────────────────────────
  { id: 'e2b',           name: 'E2B Sandbox',              endpoint: 'execute',  adapter: 'e2b',         type: 'sync',  cost: 0.003 },
  { id: 'daytona',       name: 'Daytona Sandbox',          endpoint: 'execute',  adapter: 'daytona',     type: 'sync',  cost: 0.003 },
  { id: 'modal',         name: 'Modal Labs',               endpoint: 'execute',  adapter: 'modal',       type: 'async', cost: 0.005 },
  { id: 'fly',           name: 'Fly.io Ephemeral',         endpoint: 'execute',  adapter: 'fly',         type: 'sync',  cost: 0.004 },
  { id: 'runpod',        name: 'RunPod Serverless',        endpoint: 'execute',  adapter: 'runpod',      type: 'async', cost: 0.005 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const p of PROVIDERS) {
      await client.query(`
        INSERT INTO providers (id, name, endpoint, adapter_type, response_type, cost_per_call_usd, api_key_encrypted, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, 'PLACEHOLDER', true)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          endpoint = EXCLUDED.endpoint,
          adapter_type = EXCLUDED.adapter_type,
          response_type = EXCLUDED.response_type,
          cost_per_call_usd = EXCLUDED.cost_per_call_usd,
          is_active = true
      `, [p.id, p.name, p.endpoint, p.adapter, p.type, p.cost]);
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${PROVIDERS.length} providers across 5 categories in PostgreSQL database`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Provider seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
