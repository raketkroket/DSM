import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { isPasswordHash } from './password';

/** One administrator account, configured with environment variables (no database). */
export const SESSION_IDLE = 24 * 60 * 60; // logged out after a day without activity
export const SESSION_MAX = 7 * 24 * 60 * 60; // and always after a week
export const DEFAULT_USERNAME = 'yassine128';

export type AdminConfig = { username: string; passwordHash: string; secret: string; ready: boolean };
export type Session = { u: string; iat: number; seen: number; id: string };

export function adminConfig(): AdminConfig {
  const username = (process.env.ADMIN_USERNAME || DEFAULT_USERNAME).trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  return { username, passwordHash, secret, ready: isPasswordHash(passwordHash) && secret.length >= 32 };
}

export const cookieName = () => (process.env.NODE_ENV === 'production' ? '__Host-dsm_admin' : 'dsm_admin');

export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_IDLE,
});

// Changing the password hash (a new password) invalidates every existing session.
const signingKey = (config: AdminConfig) => createHmac('sha256', config.secret).update(`dsm-admin-session:${config.passwordHash}`).digest();
const sign = (config: AdminConfig, payload: string) => createHmac('sha256', signingKey(config)).update(payload).digest('base64url');

export function newSession(config: AdminConfig, now = Date.now()): Session {
  const seconds = Math.floor(now / 1000);
  return { u: config.username, iat: seconds, seen: seconds, id: randomBytes(12).toString('base64url') };
}

export function encodeSession(config: AdminConfig, session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(config, payload)}`;
}

export function decodeSession(config: AdminConfig, raw: string | undefined, now?: number): Session | null {
  if (!config.ready || !raw || raw.length > 1000) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(config, payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  let session: Session;
  try {
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  const seconds = Math.floor((now ?? Date.now()) / 1000);
  if (session.u !== config.username || typeof session.iat !== 'number' || typeof session.seen !== 'number') return null;
  if (seconds - session.seen > SESSION_IDLE || seconds - session.iat > SESSION_MAX || session.iat > seconds + 60) return null;
  return session;
}

/** Constant-time comparison for usernames. */
export function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
