import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

type ScryptOptions = { N: number; r: number; p: number; maxmem: number };

function scrypt(password: string, salt: Buffer, length: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

/**
 * Password hashes look like scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>.
 * Create one with `npm run admin:wachtwoord`; only the hash is stored (as ADMIN_PASSWORD_HASH).
 */
export async function hashPassword(password: string, { N = 32768, r = 8, p = 1 } = {}) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, 64, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isInteger) || N < 16384 || N > 1048576) return false;
  const salt = Buffer.from(parts[4], 'base64');
  const expected = Buffer.from(parts[5], 'base64');
  if (expected.length === 0) return false;
  const actual = await scrypt(String(password).normalize('NFKC'), salt, expected.length, { N, r, p, maxmem: 128 * N * r * 2 });
  return timingSafeEqual(actual, expected);
}

export const isPasswordHash = (value: string) => value.startsWith('scrypt$') && value.split('$').length === 6 && value === value.trim();
