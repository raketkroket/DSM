import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { safeNext } from '@/lib/admin/auth';
import { createSessionClient } from '@/lib/supabase/server';

/**
 * Landing point for Supabase email links (password recovery, invitations).
 * Supports both the PKCE `code` flow and the `token_hash` email-template flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get('volgende') ?? searchParams.get('next'));
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSessionClient();
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  const target = request.nextUrl.clone();
  target.search = '';
  if (ok) {
    target.pathname = type === 'recovery' || type === 'invite' ? '/admin/wachtwoord-herstellen' : next;
  } else {
    target.pathname = '/admin/login';
    target.searchParams.set('fout', 'link');
  }
  return NextResponse.redirect(target);
}
