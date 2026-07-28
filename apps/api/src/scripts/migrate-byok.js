require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_provider_keys (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id       TEXT NOT NULL REFERENCES providers(id),
      api_key_encrypted TEXT NOT NULL,
      label             TEXT,
      is_active         BOOLEAN NOT NULL DEFAULT true,
      last_used_at      TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, provider_id)
    )
  `);
  console.log('✅ user_provider_keys table created');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_upk_user_id ON user_provider_keys(user_id)`);
  console.log('✅ idx_upk_user_id index created');

  await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_byok BOOLEAN NOT NULL DEFAULT false`);
  console.log('✅ jobs.is_byok column added');
}

migrate().catch(e => { console.error('Migration error:', e.message); process.exit(1); }).finally(() => pool.end());
