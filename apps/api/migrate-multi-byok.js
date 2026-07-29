// migrate-multi-byok.js — Schema migration for OpenRouter-style Multi-Key BYOK
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure user_provider_keys has an id primary key column
    await client.query(`
      ALTER TABLE user_provider_keys
      ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
    `);

    // 2. Add key_type column ('prioritized' | 'fallback')
    await client.query(`
      ALTER TABLE user_provider_keys
      ADD COLUMN IF NOT EXISTS key_type TEXT NOT NULL DEFAULT 'prioritized';
    `);

    // 3. Add priority_order column
    await client.query(`
      ALTER TABLE user_provider_keys
      ADD COLUMN IF NOT EXISTS priority_order INTEGER NOT NULL DEFAULT 0;
    `);

    // 4. Drop unique constraint on (user_id, provider_id) if it exists so users can store multiple keys per provider
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'user_provider_keys_user_id_provider_id_key'
        ) THEN
          ALTER TABLE user_provider_keys DROP CONSTRAINT user_provider_keys_user_id_provider_id_key;
        END IF;
      END $$;
    `);

    // Add composite index for fast retrieval of user provider keys
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_upk_user_provider ON user_provider_keys(user_id, provider_id, key_type, priority_order);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration complete: user_provider_keys supports multi-key prioritization & fallbacks');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
