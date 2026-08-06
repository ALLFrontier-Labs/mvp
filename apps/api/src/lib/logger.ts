// lib/logger.ts — Secure structured logger with data redaction
// NEVER logs: raw API keys, provider keys, auth tokens, passwords, request/response bodies

const SENSITIVE_PATTERNS = [
  /ld_[a-f0-9]{96}/gi,              // LiteDaemon API keys
  /Bearer\s+[^\s]+/gi,              // Authorization headers
  /sk-[a-zA-Z0-9_-]{20,}/gi,       // Provider API keys (OpenAI-style)
  /tvly-[a-zA-Z0-9_-]{10,}/gi,     // Tavily keys
  /key_[a-zA-Z0-9_-]{10,}/gi,      // Generic API keys
  /whsec_[a-zA-Z0-9_-]{10,}/gi,    // Webhook secrets
  /GOCSPX-[a-zA-Z0-9_-]+/gi,       // Google client secrets
  /password["\s:=]+[^\s,}]+/gi,     // Password fields
  /secret["\s:=]+[^\s,}]+/gi,       // Secret fields
];

const REDACTED_HEADERS = new Set([
  'authorization',
  'x-provider-key',
  'x-api-key-override',
  'cookie',
  'set-cookie',
]);

function redact(input: string): string {
  let result = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function redactObject(obj: any, depth = 0): any {
  if (depth > 5) return '[TRUNCATED]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return redact(obj);
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, depth + 1));
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Fully redact known sensitive keys
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      lowerKey.includes('api_key') ||
      lowerKey.includes('apikey') ||
      lowerKey.includes('api_key_encrypted') ||
      lowerKey.includes('key_hash') ||
      lowerKey.includes('authorization') ||
      lowerKey.includes('rawkey') ||
      lowerKey.includes('raw_key') ||
      lowerKey === 'rawbody'
    ) {
      cleaned[key] = '[REDACTED]';
      continue;
    }

    // Skip full request/response bodies (prompts, scrape results)
    if (
      lowerKey === 'body' ||
      lowerKey === 'result' ||
      lowerKey === 'params' ||
      lowerKey === 'query'
    ) {
      cleaned[key] = typeof value === 'object' ? '[BODY_OMITTED]' : redact(String(value));
      continue;
    }

    cleaned[key] = redactObject(value, depth + 1);
  }
  return cleaned;
}

function safeRedactHeaders(headers: Record<string, any>): Record<string, any> {
  const safe: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (REDACTED_HEADERS.has(key.toLowerCase())) {
      safe[key] = '[REDACTED]';
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  event: string;
  timestamp: string;
  [key: string]: any;
}

function formatLog(entry: LogEntry): string {
  const { level, event, timestamp, ...rest } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}] ${event}`;
  const extra = Object.keys(rest).length > 0 ? ' ' + JSON.stringify(redactObject(rest)) : '';
  return prefix + extra;
}

export const logger = {
  info(event: string, data?: Record<string, any>): void {
    const entry: LogEntry = { level: 'info', event, timestamp: new Date().toISOString(), ...data };
    console.log(formatLog(entry));
  },

  warn(event: string, data?: Record<string, any>): void {
    const entry: LogEntry = { level: 'warn', event, timestamp: new Date().toISOString(), ...data };
    console.warn(formatLog(entry));
  },

  error(event: string, error?: Error | any, data?: Record<string, any>): void {
    const entry: LogEntry = {
      level: 'error',
      event,
      timestamp: new Date().toISOString(),
      errorType: error?.name || error?.constructor?.name || 'Error',
      errorMessage: redact(String(error?.message || error || '')),
      ...data,
    };
    console.error(formatLog(entry));
  },

  debug(event: string, data?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'production') return;
    const entry: LogEntry = { level: 'debug', event, timestamp: new Date().toISOString(), ...data };
    console.log(formatLog(entry));
  },

  /** Log an HTTP request — safe for production (no body, no auth tokens) */
  request(method: string, path: string, userId?: string, extra?: Record<string, any>): void {
    logger.info('http_request', { method, path, userId, ...extra });
  },

  /** Log a webhook event — redacts payload body */
  webhook(eventType: string, extra?: Record<string, any>): void {
    logger.info('webhook_received', { eventType, ...extra });
  },

  /** Log a billing event */
  billing(action: string, userId: string, amount?: number, extra?: Record<string, any>): void {
    logger.info('billing_event', { action, userId, amountUsd: amount, ...extra });
  },

  /** Redact headers for safe logging */
  safeHeaders(headers: Record<string, any>): Record<string, any> {
    return safeRedactHeaders(headers);
  },
};
