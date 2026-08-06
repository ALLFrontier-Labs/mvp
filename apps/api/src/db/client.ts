import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.trim(),
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('.com')
    ? { rejectUnauthorized: false } // Required for Supabase connection pooler
    : false,
  // CRITICAL FIX: Serverless environments (Vercel/Railway) spin up many instances.
  // A high pool max (20) exhausts Supabase's direct connection limits instantly,
  // which Supabase's PgBouncer often returns as "password authentication failed".
  // Node serverless functions only need 1-2 connections per instance.
  max: isProduction ? 2 : 10,
  idleTimeoutMillis: 10000, // Close idle connections quickly to free up pool
  connectionTimeoutMillis: 5000, // Fail fast if pool is exhausted
  statement_timeout: 10000, // 10s max query time
  idle_in_transaction_session_timeout: 10000,
} as any);

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err.message);
});
