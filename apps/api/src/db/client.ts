import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('.com')
    ? { rejectUnauthorized: false } // Required for Supabase connection pooler
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Prevent long-running queries from exhausting connections
  statement_timeout: 30000,           // 30s max query time
  idle_in_transaction_session_timeout: 60000, // 60s max idle-in-transaction
} as any);

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err.message);
});
