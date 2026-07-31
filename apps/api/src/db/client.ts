import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isSupabase = process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('.com');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});
