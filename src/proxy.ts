import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/wachtwoord-vergeten', '/admin/auth/bevestigen'];

/**
 * Keeps the Supabase session cookie fresh for the admin area and sends visitors without a
 * session to the login page. This is only an optimistic check: every admin page, server
 * action and query re-verifies the user and admin role on the server (and RLS in Postgres).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([header, value]) => response.headers.set(header, value));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ADMIN_PATHS.some((publicPath) => path.startsWith(publicPath));

  if (!user && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = path === '/admin' ? '' : `?volgende=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
