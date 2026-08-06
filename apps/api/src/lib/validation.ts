// lib/validation.ts — Input validation & sanitization for all public endpoints
// Prevents injection, enforces types, and sanitizes user input

export interface ValidationError {
  field: string;
  message: string;
}

export class RequestValidationError extends Error {
  public fields: ValidationError[];
  constructor(fields: ValidationError[]) {
    super(`Validation failed: ${fields.map(f => f.message).join(', ')}`);
    this.name = 'RequestValidationError';
    this.fields = fields;
  }
}

// ── Email Validation ──────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.trim()) {
    throw new RequestValidationError([{ field: 'email', message: 'Email is required' }]);
  }
  const cleaned = email.toLowerCase().trim();
  if (cleaned.length > 254) {
    throw new RequestValidationError([{ field: 'email', message: 'Email is too long (max 254 chars)' }]);
  }
  if (!EMAIL_REGEX.test(cleaned)) {
    throw new RequestValidationError([{ field: 'email', message: 'Invalid email format' }]);
  }
  return cleaned;
}

// ── Password Validation ───────────────────────────────────────────────────────
export function validatePassword(password: unknown, required = true): string | undefined {
  if (password === undefined || password === null || password === '') {
    if (required) {
      throw new RequestValidationError([{ field: 'password', message: 'Password is required' }]);
    }
    return undefined;
  }
  if (typeof password !== 'string') {
    throw new RequestValidationError([{ field: 'password', message: 'Password must be a string' }]);
  }
  if (password.length < 8) {
    throw new RequestValidationError([{ field: 'password', message: 'Password must be at least 8 characters' }]);
  }
  if (password.length > 128) {
    throw new RequestValidationError([{ field: 'password', message: 'Password is too long (max 128 chars)' }]);
  }
  return password;
}

// ── Name Validation (optional field) ──────────────────────────────────────────
export function validateName(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim().slice(0, 100); // cap at 100 chars
  // Strip any HTML/script tags
  return cleaned.replace(/<[^>]*>/g, '');
}

// ── Provider ID Validation ────────────────────────────────────────────────────
const VALID_PROVIDER_PATTERN = /^[a-z0-9_-]{1,50}$/;

export function validateProviderId(providerId: unknown, allowAuto = true): string {
  if (typeof providerId !== 'string' || !providerId.trim()) {
    throw new RequestValidationError([{ field: 'provider_id', message: 'provider_id is required' }]);
  }
  const cleaned = providerId.toLowerCase().trim();
  if (allowAuto && cleaned === 'auto') return 'auto';
  if (!VALID_PROVIDER_PATTERN.test(cleaned)) {
    throw new RequestValidationError([{ field: 'provider_id', message: 'Invalid provider_id format' }]);
  }
  return cleaned;
}

// ── API Key Validation ────────────────────────────────────────────────────────
export function validateApiKeyInput(apiKey: unknown): string {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new RequestValidationError([{ field: 'api_key', message: 'API key is required' }]);
  }
  const cleaned = apiKey.trim();
  if (cleaned.length < 4) {
    throw new RequestValidationError([{ field: 'api_key', message: 'API key must be at least 4 characters' }]);
  }
  if (cleaned.length > 500) {
    throw new RequestValidationError([{ field: 'api_key', message: 'API key is too long (max 500 chars)' }]);
  }
  return cleaned;
}

// ── Amount Validation ─────────────────────────────────────────────────────────
export function validateAmount(amount: unknown, min: number, max: number, fieldName = 'amount'): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) {
    throw new RequestValidationError([{ field: fieldName, message: `${fieldName} must be a valid number` }]);
  }
  if (num < min || num > max) {
    throw new RequestValidationError([{ field: fieldName, message: `${fieldName} must be between $${min} and $${max}` }]);
  }
  return num;
}

// ── Search Params Validation ──────────────────────────────────────────────────
export function validateSearchParams(params: unknown): { query: string; [key: string]: any } {
  if (!params || typeof params !== 'object') {
    throw new RequestValidationError([{ field: 'params', message: 'params object is required' }]);
  }
  const p = params as Record<string, any>;
  if (!p.query || typeof p.query !== 'string' || !p.query.trim()) {
    throw new RequestValidationError([{ field: 'params.query', message: 'params.query is required' }]);
  }
  if (p.query.length > 2000) {
    throw new RequestValidationError([{ field: 'params.query', message: 'Query is too long (max 2000 chars)' }]);
  }
  return { ...p, query: p.query.trim() };
}

// ── URL Validation ────────────────────────────────────────────────────────────
export function validateUrl(url: unknown, fieldName = 'url'): string {
  if (typeof url !== 'string' || !url.trim()) {
    throw new RequestValidationError([{ field: fieldName, message: `${fieldName} is required` }]);
  }
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new RequestValidationError([{ field: fieldName, message: `${fieldName} must be a valid HTTP(S) URL` }]);
  }
}

// ── Key Type Validation ───────────────────────────────────────────────────────
export function validateKeyType(keyType: unknown): 'prioritized' | 'fallback' {
  if (keyType === 'prioritized' || keyType === 'fallback') return keyType;
  throw new RequestValidationError([{ field: 'key_type', message: 'key_type must be "prioritized" or "fallback"' }]);
}

// ── Generic Object Validation ─────────────────────────────────────────────────
export function validateParams(params: unknown): Record<string, any> {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    throw new RequestValidationError([{ field: 'params', message: 'params must be a valid object' }]);
  }
  return params as Record<string, any>;
}

// ── OAuth Code Validation ─────────────────────────────────────────────────────
export function validateOAuthCode(code: unknown): string {
  if (typeof code !== 'string' || !code.trim()) {
    throw new RequestValidationError([{ field: 'code', message: 'Authorization code is required' }]);
  }
  if (code.length > 2048) {
    throw new RequestValidationError([{ field: 'code', message: 'Authorization code is too long' }]);
  }
  return code.trim();
}

export function validateRedirectUri(uri: unknown): string {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new RequestValidationError([{ field: 'redirectUri', message: 'Redirect URI is required' }]);
  }
  // Only allow our own domains
  try {
    const parsed = new URL(uri.trim());
    const hostname = parsed.hostname;
    const isAllowed =
      hostname === 'www.litedaemon.xyz' ||
      hostname === 'litedaemon.xyz' ||
      hostname.endsWith('.vercel.app') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1';
    if (!isAllowed) {
      throw new RequestValidationError([{ field: 'redirectUri', message: 'Redirect URI is not from an allowed domain' }]);
    }
    return parsed.toString();
  } catch (e) {
    if (e instanceof RequestValidationError) throw e;
    throw new RequestValidationError([{ field: 'redirectUri', message: 'Invalid redirect URI' }]);
  }
}
