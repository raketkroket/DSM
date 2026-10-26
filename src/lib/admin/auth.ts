import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { adminConfig, cookieName, decodeSession } from '@/lib/server/session';
import { getStorage, type Storage } from '@/lib/server/storage';

export type AdminContext = { username: string; storage: Storage | null };

/** Verifies the signed session cookie. The proxy already refreshed it; this re-checks it on the server. */
export async function getAdmin(): Promise<AdminContext | null> {
  // Always read the request first, so an admin check can never be prerendered into a static page.
  await connection();
  const jar = await cookies();
  const config = adminConfig();
  const session = decodeSession(config, jar.get(cookieName())?.value);
  if (!session) return null;
  return { username: config.username, storage: getStorage() };
}

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/** For pages that read or save content: the storage must be connected. */
export async function requireEditor(): Promise<{ username: string; storage: Storage }> {
  const admin = await requireAdmin();
  if (!admin.storage) redirect('/admin?opslag=ontbreekt');
  return { username: admin.username, storage: admin.storage };
}

/** Safe in-app redirect target (prevents open redirects through ?volgende=). */
export function safeNext(value: unknown) {
  return typeof value === 'string' && value.startsWith('/admin') && !value.startsWith('//') ? value : '/admin';
}
