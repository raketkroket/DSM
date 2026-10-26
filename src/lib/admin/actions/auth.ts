'use server';

import { createHash } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { count, hit, release } from '@/lib/server/kv';
import { verifyPassword } from '@/lib/server/password';
import { adminConfig, cookieName, cookieOptions, encodeSession, newSession, sameText } from '@/lib/server/session';
import { safeNext } from '../auth';

export type AuthState = { error?: string; username?: string };

const IP_LIMIT = 5; // failed logins per address per 15 minutes
const ACCOUNT_LIMIT = 20; // failed logins for the account per hour, all addresses together
// Used when the username is wrong, so a wrong username takes as long as a wrong password.
const DUMMY_HASH = 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

async function clientKey() {
  const list = await headers();
  const ip = list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

const wait = (seconds: number) => `Te veel mislukte pogingen. Probeer het over ${Math.max(1, Math.ceil(seconds / 60))} minuten opnieuw.`;

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const config = adminConfig();
  if (!config.ready) return { error: 'Het inloggen is nog niet ingesteld. Neem contact op met uw websitebouwer.' };
  const username = String(formData.get('username') ?? '').trim().slice(0, 100);
  const password = String(formData.get('password') ?? '').slice(0, 200);
  if (!username || !password) return { error: 'Vul uw gebruikersnaam en wachtwoord in.', username };

  const ipKey = `dsm:login:ip:${await clientKey()}`;
  const accountKey = 'dsm:login:account';
  try {
    const [ip, account] = await Promise.all([count(ipKey), count(accountKey)]);
    if (ip.count >= IP_LIMIT) return { error: wait(ip.retryAfter), username };
    if (account.count >= ACCOUNT_LIMIT) return { error: wait(account.retryAfter), username };
  } catch (error) {
    console.error('Inlogbeveiliging niet bereikbaar:', error instanceof Error ? error.message : error);
    return { error: 'Inloggen is tijdelijk niet mogelijk. Probeer het over enkele minuten opnieuw.', username };
  }

  const userOk = sameText(username.toLowerCase(), config.username.toLowerCase());
  const passwordOk = await verifyPassword(password, userOk ? config.passwordHash : DUMMY_HASH);
  if (!userOk || !passwordOk) {
    await Promise.all([hit(ipKey, 15 * 60), hit(accountKey, 60 * 60)]).catch(() => {});
    // Same message for a wrong username and a wrong password.
    return { error: 'Onjuiste gebruikersnaam of wachtwoord.', username };
  }

  await release(ipKey).catch(() => {});
  const jar = await cookies();
  jar.set(cookieName(), encodeSession(config, newSession(config)), cookieOptions());
  redirect(safeNext(formData.get('volgende')));
}

export async function signOut() {
  const jar = await cookies();
  jar.set(cookieName(), '', { ...cookieOptions(), maxAge: 0 });
  redirect('/admin/login?uitgelogd=1');
}
