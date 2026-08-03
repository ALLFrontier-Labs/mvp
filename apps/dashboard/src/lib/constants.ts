export const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

export const APP_URL = (import.meta as any).env?.VITE_APP_URL || 'https://www.litedaemon.xyz';
export const GATEWAY_URL = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_GATEWAY_URL || 'https://www.litedaemon.xyz/v1';

export const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('litedaemon.xyz') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}/auth/callback`;
    }
  }
  return 'https://www.litedaemon.xyz/auth/callback';
};
