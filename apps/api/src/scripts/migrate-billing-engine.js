require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('⏳ Running migration for Billing Engine columns on users and ledger_entries tables...');
  
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_call_count INTEGER NOT NULL DEFAULT 0`);
  console.log('✅ users.monthly_call_count column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  console.log('✅ users.billing_period_start column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_balance NUMERIC(18, 8) NOT NULL DEFAULT 0`);
  console.log('✅ users.credit_balance column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`);
  console.log('✅ users.stripe_customer_id column added');

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT`);
  console.log('✅ users.stripe_payment_method_id column added');

  await pool.query(`ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS raw_provider_cost NUMERIC(18, 8)`);
  console.log('✅ ledger_entries.raw_provider_cost column added');

  await pool.query(`ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS markup_amount NUMERIC(18, 8)`);
  console.log('✅ ledger_entries.markup_amount column added');

  await pool.query(`ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS total_deducted NUMERIC(18, 8)`);
  console.log('✅ ledger_entries.total_deducted column added');

  console.log('🎉 Billing Engine DB Migration Complete!');
}

migrate()
  .catch(e => { console.error('❌ Migration error:', e.message); process.exit(1); })
  .finally(() => pool.end());
