import 'server-only';

/**
 * Small counters and one-time keys (login attempts, form rate limits, repeated submissions).
 * Shared across serverless instances through Upstash Redis when configured (free tier, via the
 * Vercel Marketplace); otherwise kept in memory per server instance, which still stops bursts.
 */
const memory = new Map<string, { value: number; until: number }>();

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

export const isRedisConfigured = () => Boolean(redisConfig());

async function redis(commands: (string | number)[][]) {
  const config = redisConfig()!;
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Redis HTTP ${response.status}`);
  const results = (await response.json()) as { result?: unknown; error?: string }[];
  return results.map((item) => {
    if (item.error) throw new Error(`Redis: ${item.error}`);
    return item.result;
  });
}

function live(key: string) {
  const entry = memory.get(key);
  if (entry && entry.until > Date.now()) return entry;
  memory.delete(key);
  return null;
}

/** Adds one to a counter that expires `windowSeconds` after its first hit. */
export async function hit(key: string, windowSeconds: number): Promise<{ count: number; retryAfter: number }> {
  if (redisConfig()) {
    const [value, , ttl] = await redis([['INCR', key], ['EXPIRE', key, windowSeconds, 'NX'], ['TTL', key]]);
    return { count: Number(value), retryAfter: Math.max(1, Number(ttl)) };
  }
  const entry = live(key) ?? { value: 0, until: Date.now() + windowSeconds * 1000 };
  entry.value += 1;
  memory.set(key, entry);
  return { count: entry.value, retryAfter: Math.ceil((entry.until - Date.now()) / 1000) };
}

export async function count(key: string): Promise<{ count: number; retryAfter: number }> {
  if (redisConfig()) {
    const [value, ttl] = await redis([['GET', key], ['TTL', key]]);
    return { count: Number(value || 0), retryAfter: Math.max(1, Number(ttl)) };
  }
  const entry = live(key);
  return entry ? { count: entry.value, retryAfter: Math.ceil((entry.until - Date.now()) / 1000) } : { count: 0, retryAfter: 0 };
}

/** Claims a key for `ttlSeconds`; false when it was already claimed (e.g. a repeated submission). */
export async function claim(key: string, ttlSeconds: number): Promise<boolean> {
  if (redisConfig()) {
    const [result] = await redis([['SET', key, 1, 'NX', 'EX', ttlSeconds]]);
    return result === 'OK';
  }
  if (live(key)) return false;
  memory.set(key, { value: 1, until: Date.now() + ttlSeconds * 1000 });
  return true;
}

export async function release(key: string) {
  if (redisConfig()) await redis([['DEL', key]]);
  else memory.delete(key);
}

export function resetMemoryStore() {
  memory.clear();
}
