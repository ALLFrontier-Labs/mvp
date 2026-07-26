// services/encryption.ts
import crypto from 'crypto';

const KEY = Buffer.from(process.env.PROVIDER_ENCRYPTION_KEY!, 'hex'); // must be 32 bytes
const ALG = 'aes-256-gcm';

export function encrypt(plain: string): string {
  const iv  = crypto.randomBytes(12);
  const c   = crypto.createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  // Stored as iv:authTag:ciphertext — all hex, colon-separated, self-contained
  return [iv.toString('hex'), c.getAuthTag().toString('hex'), enc.toString('hex')].join(':');
}

export function decrypt(stored: string): string {
  const [ih, th, ch] = stored.split(':');
  const d = crypto.createDecipheriv(ALG, KEY, Buffer.from(ih, 'hex'));
  d.setAuthTag(Buffer.from(th, 'hex'));
  return d.update(Buffer.from(ch, 'hex')).toString('utf8') + d.final('utf8');
}
