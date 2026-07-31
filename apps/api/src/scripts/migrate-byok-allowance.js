require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('⏳ Running migration for BYOK Monthly Allowance & Reset columns on users table...');
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS byok_requests_this_month INTEGER NOT NULL DEFAULT 0`);
  console.log('✅ users.byok_requests_this_month column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS byok_last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  console.log('✅ users.byok_last_reset_at column added');
}

migrate()
  .catch(e => { console.error('❌ Migration error:', e.message); process.exit(1); })
  .finally(() => pool.end());
