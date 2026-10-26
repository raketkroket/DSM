import { NextResponse, type NextRequest } from 'next/server';
import { adminConfig, cookieName, cookieOptions, decodeSession, encodeSession } from '@/lib/server/session';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];
const REFRESH_AFTER = 5 * 60; // seconds; keeps the idle timeout rolling while the admin works

/**
 * Sends visitors without a valid session to the login page and keeps an active session alive.
 * This is only the first check: every admin page and server action verifies the cookie again.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ADMIN_PATHS.some((publicPath) => path.startsWith(publicPath));
  const config = adminConfig();
  const session = decodeSession(config, request.cookies.get(cookieName())?.value);

  if (!session) {
    if (isPublic) return NextResponse.next();
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = path === '/admin' ? '' : `?volgende=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - session.seen < REFRESH_AFTER) return NextResponse.next();
  const value = encodeSession(config, { ...session, seen: now });
  request.cookies.set(cookieName(), value);
  const response = NextResponse.next({ request });
  response.cookies.set(cookieName(), value, cookieOptions());
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
