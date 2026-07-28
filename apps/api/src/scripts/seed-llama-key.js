require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');

const KEY = Buffer.from(process.env.PROVIDER_ENCRYPTION_KEY, 'hex');
const ALG = 'aes-256-gcm';

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv.toString('hex'), c.getAuthTag().toString('hex'), enc.toString('hex')].join(':');
}

async function seed() {
  const rawKey = 'llx-1GJyqkD0YhT762NpX4njJmgCWSQQeV0wcAjepGJo1tHYW4qV';
  const encrypted = encrypt(rawKey);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(
      `UPDATE providers SET api_key_encrypted = $1, is_active = true WHERE id = 'llamaparse' RETURNING id, name`,
      [encrypted]
    );
    console.log('✅ Successfully encrypted & updated key for provider:', res.rows[0]);
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
