import type { AuthUser } from '@/models';

export const AUTH_TOKEN_COOKIE = 'upnews_auth_token';
export const AUTH_USER_COOKIE = 'upnews_auth_user';

export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { days, path = '/', sameSite = 'Lax', secure = window.location.protocol === 'https:' } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;

  if (typeof days === 'number') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.substring(encodedName.length));
    }
  }
  return null;
}

export function removeCookie(name: string, path = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
}

export function saveAuthSessionCookies(token: string, user: AuthUser, rememberMe = false): void {
  const cookieOptions: CookieOptions = rememberMe ? { days: 7 } : {};
  setCookie(AUTH_TOKEN_COOKIE, token, cookieOptions);
  setCookie(AUTH_USER_COOKIE, JSON.stringify(user), cookieOptions);
}

export function getAuthTokenFromCookie(): string | null {
  return getCookie(AUTH_TOKEN_COOKIE);
}

export function getAuthUserFromCookie(): AuthUser | null {
  const raw = getCookie(AUTH_USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSessionCookies(): void {
  removeCookie(AUTH_TOKEN_COOKIE);
  removeCookie(AUTH_USER_COOKIE);
}
