import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  }

  // Generate production API key for default user initialization
  const rawKey = 'ld_live_' + crypto.randomBytes(16).toString('hex'); // 32 random hex characters

  const redirectUrl = new URL('/overview', request.url);
  redirectUrl.searchParams.set('welcome', 'true');
  redirectUrl.searchParams.set('key', rawKey);

  const response = NextResponse.redirect(redirectUrl);

  // Set session cookies
  response.cookies.set('litedaemon_session', rawKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set('litedaemon_api_key', rawKey, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
