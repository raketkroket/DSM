import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let result: { error: { message: string } | null } = { error: null };
let configured = true;
const calls: string[] = [];
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () =>
    configured
      ? { from: (table: string) => (calls.push(table), { select: () => ({ limit: async () => result }) }) }
      : null,
}));

const { GET } = await import('@/app/api/keepalive/route');
const ping = (auth?: string) => GET(new Request('http://localhost/api/keepalive', { headers: auth ? { authorization: auth } : {} }));

describe('keep-alive', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
    result = { error: null };
    configured = true;
    calls.length = 0;
  });
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('queries the database when called with the cron secret', async () => {
    const response = await ping('Bearer test-secret');
    expect(response.status).toBe(200);
    expect(calls).toEqual(['content_published']);
  });

  it('rejects calls without the right secret', async () => {
    expect((await ping()).status).toBe(401);
    expect((await ping('Bearer wrong')).status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('refuses to run without a configured secret', async () => {
    delete process.env.CRON_SECRET;
    expect((await ping('Bearer ')).status).toBe(503);
  });

  it('reports a database error instead of claiming success', async () => {
    result = { error: { message: 'paused' } };
    expect((await ping('Bearer test-secret')).status).toBe(502);
  });

  it('explains when Supabase is not configured', async () => {
    configured = false;
    expect((await ping('Bearer test-secret')).status).toBe(503);
  });
});
