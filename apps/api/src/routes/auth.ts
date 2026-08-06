import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';
import { createUser, loginWithPassword, socialLoginOrSignup, generateApiKey, bustAuthCache } from '../services/auth';
import { logger } from '../lib/logger';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateOAuthCode,
  validateRedirectUri,
} from '../lib/validation';
import axios from 'axios';

// Google OAuth — MUST be configured via environment variables. No hardcoded fallbacks.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'https://www.litedaemon.xyz';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  logger.warn('google_oauth_not_configured', { message: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth will be disabled.' });
}

export async function authRoute(app: FastifyInstance) {

  // ── Signup Endpoint ────────────────────────────────────────────────────────
  app.post('/v1/auth/signup', { config: { public: true } }, async (req, reply) => {
    const body = req.body as any;

    let email: string;
    let password: string | undefined;
    let firstName: string | undefined;
    let lastName: string | undefined;

    try {
      email = validateEmail(body?.email);
      password = validatePassword(body?.password, false);
      firstName = validateName(body?.firstName, 'firstName');
      lastName = validateName(body?.lastName, 'lastName');
    } catch (e: any) {
      return reply.code(422).send({ error: 'validation_error', message: e.message, fields: e.fields });
    }

    try {
      const res = await createUser(email, password, firstName, lastName);
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: 'Account created successfully.',
      });
    } catch (e: any) {
      if (e.code === '23505')
        return reply.code(409).send({ error: 'email_already_registered', message: 'Email is already registered. Please sign in.' });
      logger.error('signup_failed', e);
      throw e;
    }
  });

  // ── Password / Magic Sign In Endpoint ──────────────────────────────────────
  app.post('/v1/auth/login', { config: { public: true } }, async (req, reply) => {
    const body = req.body as any;

    let email: string;
    try {
      email = validateEmail(body?.email);
    } catch (e: any) {
      return reply.code(422).send({ error: 'validation_error', message: e.message, fields: e.fields });
    }

    const password = body?.password;

    try {
      const res = await loginWithPassword(email, password);
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: 'Signed in successfully.',
      });
    } catch (e: any) {
      if (e.message === 'user_not_found') {
        return reply.code(404).send({ error: 'user_not_found', message: 'No account found with this email address.' });
      }
      if (e.message === 'invalid_credentials') {
        return reply.code(401).send({ error: 'invalid_credentials', message: 'Incorrect password. Please try again.' });
      }
      if (e.message === 'password_required') {
        return reply.code(401).send({ error: 'password_required', message: 'Password is required to sign in.' });
      }
      logger.error('login_failed', e);
      throw e;
    }
  });

  // ── Google OAuth Token Exchange ──────────────────────────────────────────
  app.post('/v1/auth/google/exchange', { config: { public: true } }, async (req, reply) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return reply.code(503).send({ error: 'oauth_not_configured', message: 'Google OAuth is not configured on this server.' });
    }

    const body = req.body as any;

    let code: string;
    let redirectUri: string;
    try {
      code = validateOAuthCode(body?.code);
      redirectUri = validateRedirectUri(body?.redirectUri);
    } catch (e: any) {
      return reply.code(400).send({ error: 'validation_error', message: e.message });
    }

    try {
      // 1. Exchange code for access token
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = tokenRes.data;

      // 2. Fetch user profile from Google
      const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const profile = userRes.data;
      if (!profile.email) throw new Error('No email found in Google profile');

      // 3. Login or signup user (server-verified email — safe to call socialLoginOrSignup)
      const res = await socialLoginOrSignup(profile.email, 'google', profile.given_name, profile.family_name);
      
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: 'Authenticated via Google successfully.',
      });
    } catch (e: any) {
      // SECURITY: Never leak raw Google error details or tokens to the client
      logger.error('google_oauth_exchange_failed', e);
      return reply.code(500).send({ 
        error: 'auth_failed', 
        message: 'Google authentication failed. Please try again.'
      });
    }
  });

  // ── Social Login / Sign-up Endpoint ─────────────────────────────────────────
  // SECURITY: This endpoint is DISABLED in production. Social login must go
  // through the verified OAuth exchange flow (/v1/auth/google/exchange) which
  // verifies the user's identity server-side before calling socialLoginOrSignup.
  //
  // The raw /v1/auth/social endpoint allowed any caller to supply an arbitrary
  // email and receive a valid API key — a critical auth bypass vulnerability.
  //
  // If GitHub/MetaMask OAuth is needed in the future, implement a proper
  // server-side token exchange (like the Google flow above) for each provider.
  app.post('/v1/auth/social', { config: { public: true } }, async (_req, reply) => {
    return reply.code(410).send({
      error: 'endpoint_disabled',
      message: 'Direct social authentication is no longer supported. Please use Google Sign-In or email/password authentication.',
    });
  });

  // ── Account profile + usage in one call ──────────────────────────────────
  app.get('/v1/me', async (req, reply) => {
    const u = req.user;
    const [user, usage] = await Promise.all([
      pool.query(`SELECT email, first_name, last_name, plan, created_at, balance_usd FROM users WHERE id = $1`, [u.id]),
      pool.query(`SELECT total_calls, billed_calls, total_spent_usd FROM user_usage WHERE user_id = $1`, [u.id]),
    ]);
    const row  = user.rows[0];
    const stat = usage.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    return reply.send({
      email:           row.email,
      first_name:      row.first_name,
      last_name:       row.last_name,
      plan:            row.plan,
      created_at:      row.created_at,
      balance_usd:     parseFloat(row.balance_usd),
      total_calls:     parseInt(stat.total_calls),
      billed_calls:    parseInt(stat.billed_calls),
      total_spent_usd: parseFloat(stat.total_spent_usd),
    });
  });

  // ── Regenerate Master API Key ──────────────────────────────────────────────
  // AUTHENTICATED: Requires a valid Bearer token. Deactivates ALL existing keys
  // for the user, generates a new server-side key, and busts the auth cache.
  app.post('/v1/auth/regenerate', async (req, reply) => {
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Deactivate ALL active keys for this user
      const deactivated = await client.query(
        `UPDATE api_keys SET is_active = false WHERE user_id = $1 AND is_active = true RETURNING id`,
        [userId]
      );

      // 2. Generate a new cryptographic key
      const { raw, hash } = generateApiKey();

      // 3. Insert the new key
      await client.query(
        `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, 'Regenerated Key')`,
        [userId, hash]
      );

      await client.query('COMMIT');

      // 4. Bust Redis auth cache for all old keys
      await bustAuthCache(userId);

      logger.info('api_key_regenerated', {
        userId,
        deactivatedCount: deactivated.rowCount || 0,
      });

      return reply.send({
        api_key: raw,
        message: 'Master API key regenerated successfully. All previous keys have been deactivated.',
        deactivated_keys: deactivated.rowCount || 0,
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      logger.error('api_key_regeneration_failed', err, { userId });
      return reply.code(500).send({
        error: 'regeneration_failed',
        message: 'Failed to regenerate API key. Please try again.',
      });
    } finally {
      client.release();
    }
  });
}

