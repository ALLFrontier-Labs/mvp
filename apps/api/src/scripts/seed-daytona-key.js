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
  const rawKey = 'dtn_8144e23891350c628f1ea8c52f4d504f9a4ecde0e43135a7e05ca5f86c77f220';
  const encrypted = encrypt(rawKey);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(
      `INSERT INTO providers (id, name, endpoint, adapter_type, response_type, cost_per_call_usd, api_key_encrypted, is_active)
       VALUES ('daytona', 'Daytona Sandbox', 'execute', 'daytona', 'sync', 0.00200000, $1, true)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         endpoint = EXCLUDED.endpoint,
         adapter_type = EXCLUDED.adapter_type,
         cost_per_call_usd = EXCLUDED.cost_per_call_usd,
         api_key_encrypted = EXCLUDED.api_key_encrypted,
         is_active = true
       RETURNING id, name, cost_per_call_usd`,
      [encrypted]
    );
    console.log('✅ Successfully encrypted & updated Daytona in database:', res.rows[0]);
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
