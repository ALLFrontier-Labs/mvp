require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  console.log('✅ users.password_hash column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
  console.log('✅ users.first_name column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`);
  console.log('✅ users.last_name column added');
}

migrate()
  .catch(e => { console.error('Migration error:', e.message); process.exit(1); })
  .finally(() => pool.end());
