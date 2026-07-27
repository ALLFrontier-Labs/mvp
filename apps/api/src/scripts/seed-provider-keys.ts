/**
 * seed-provider-keys.ts
 * One-time script: encrypt real provider API keys and write them to the DB.
 * Run on Railway via: node -r dotenv/config dist/scripts/seed-provider-keys.js
 * Or locally:         ts-node -r dotenv/config src/scripts/seed-provider-keys.ts
 */
import 'dotenv/config';
import crypto from 'crypto';
import { Pool } from 'pg';

// ── Inline encrypt (avoids importing the full service) ─────────────────────────
const KEY = Buffer.from(process.env.PROVIDER_ENCRYPTION_KEY!, 'hex');
const ALG = 'aes-256-gcm';

function encrypt(plain: string): string {
  const iv  = crypto.randomBytes(12);
  const c   = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv.toString('hex'), c.getAuthTag().toString('hex'), enc.toString('hex')].join(':');
}

// ── Provider keys to seed ──────────────────────────────────────────────────────
// Format: { name: <exact name from providers table>, key: <plaintext key> }
const KEYS: { name: string; key: string }[] = [
  { name: 'Firecrawl',   key: 'fc-5470ccd54e39412c86825bdfe7223eae' },
  { name: 'Tavily',      key: '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' },
  { name: 'Browserbase', key: 'bb_live_8fvVA63yMNfX3k8HZc1wGJJE414' },
];

async function main() {
  if (!process.env.PROVIDER_ENCRYPTION_KEY) {
    console.error('❌ PROVIDER_ENCRYPTION_KEY is not set');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('🔐 Seeding provider API keys...\n');

  for (const { name, key } of KEYS) {
    const encrypted = encrypt(key);
    const result = await pool.query(
      `UPDATE providers SET api_key_encrypted = $1 WHERE name = $2 RETURNING id, name`,
      [encrypted, name]
    );
    if (result.rowCount === 0) {
      console.warn(`  ⚠  No provider found with name "${name}" — skipping`);
    } else {
      console.log(`  ✅ ${name} (id=${result.rows[0].id}) — key encrypted & stored`);
    }
  }

  console.log('\n✅ Done. Verify with:');
  console.log('   SELECT name, LEFT(api_key_encrypted, 20) AS preview FROM providers WHERE name IN (\'Firecrawl\',\'Tavily\',\'Browserbase\');');

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
