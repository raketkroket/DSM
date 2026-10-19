import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/env';
import { createSessionClient } from '@/lib/supabase/server';

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
  user: { id: string; email: string };
};

/** Verifies the session with Supabase Auth and the admin role in the database. */
export async function getAdmin(): Promise<AdminContext | null> {
  // Always read the request first, so an admin check can never be prerendered into a static page.
  await cookies();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) return null;
  return { supabase, user: { id: user.id, email: user.email ?? '' } };
}

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/** Safe in-app redirect target (prevents open redirects through ?volgende=). */
export function safeNext(value: unknown) {
  return typeof value === 'string' && value.startsWith('/admin') && !value.startsWith('//') ? value : '/admin';
}
