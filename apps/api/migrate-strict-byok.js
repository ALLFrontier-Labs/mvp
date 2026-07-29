// migrate-strict-byok.js
// Adds `always_use_this_key` (strict isolation mode) to user_provider_keys
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add always_use_this_key column if it doesn't exist
    await client.query(`
      ALTER TABLE user_provider_keys
      ADD COLUMN IF NOT EXISTS always_use_this_key BOOLEAN NOT NULL DEFAULT false;
    `);

    console.log('✅ Added always_use_this_key column to user_provider_keys');

    await client.query('COMMIT');
    console.log('✅ Migration complete: strict BYOK isolation mode enabled');
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
