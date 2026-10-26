import { timingSafeEqual } from 'node:crypto';
import { createPublicClient } from '@/lib/supabase/public';

export const maxDuration = 10;

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Daily ping from Vercel Cron (see vercel.json). A free Supabase project pauses after a week
 * without activity; public pages are cached, so this small query keeps the database awake.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) return json(503, { ok: false, message: 'CRON_SECRET is not set.' });
  if (!authorised(request)) return json(401, { ok: false, message: 'Unauthorised.' });
  const supabase = createPublicClient();
  if (!supabase) return json(503, { ok: false, message: 'Supabase is not configured.' });
  const { error } = await supabase.from('content_published').select('key').limit(1);
  if (error) {
    console.error('Keep-alive mislukt:', error.message);
    return json(502, { ok: false, message: error.message });
  }
  return json(200, { ok: true, at: new Date().toISOString() });
}
