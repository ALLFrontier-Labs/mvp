require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  // Check if Firecrawl key exists to reuse for firecrawl_parse
  const fc = await pool.query(`SELECT api_key_encrypted FROM providers WHERE id = 'firecrawl'`);
  const fcKey = fc.rows[0]?.api_key_encrypted || 'PLACEHOLDER';

  // Seed firecrawl_parse and llamaparse
  await pool.query(`
    INSERT INTO providers (id, name, endpoint, adapter_type, response_type, cost_per_call_usd, api_key_encrypted, is_active)
    VALUES 
      ('firecrawl_parse', 'Firecrawl Document Parse', 'document', 'firecrawl_parse', 'sync', 0.00500000, $1, true),
      ('llamaparse',      'LlamaParse API',           'document', 'llamaparse',      'sync', 0.00300000, 'PLACEHOLDER', true)
    ON CONFLICT (id) DO UPDATE SET
      endpoint = EXCLUDED.endpoint,
      adapter_type = EXCLUDED.adapter_type,
      cost_per_call_usd = EXCLUDED.cost_per_call_usd,
      is_active = true
  `, [fcKey]);

  console.log('✅ Document parsing providers (firecrawl_parse & llamaparse) created/updated');
}

migrate()
  .catch(e => { console.error('Migration error:', e.message); process.exit(1); })
  .finally(() => pool.end());
