import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toDay } from '@/lib/availability';
import { mergeSite } from '@/lib/content/merge';
import { contactSchema, quoteSchema } from '@/lib/enquiry/schema';

/* ── Fake Supabase: records operations and answers from simple state ── */
type Row = Record<string, unknown>;
const db: { rows: Row[]; inserts: Row[]; updates: Row[] } = { rows: [], inserts: [], updates: [] };

function query(table: string) {
  const filters: [string, string, unknown][] = [];
  let mode: 'select' | 'count' = 'select';
  let pendingInsert: Row | null = null;
  let pendingUpdate: Row | null = null;
  const run = () => {
    if (pendingInsert) {
      if (db.rows.some((row) => row.submission_token === pendingInsert!.submission_token)) {
        return { data: null, error: { code: '23505', message: 'duplicate' } };
      }
      const row = { id: '00000000-0000-4000-8000-000000000001', created_at: new Date().toISOString(), ...pendingInsert };
      db.rows.push(row);
      db.inserts.push(row);
      return { data: row, error: null };
    }
    if (pendingUpdate) {
      db.updates.push(pendingUpdate);
      return { data: null, error: null };
    }
    const matches = db.rows.filter((row) =>
      filters.every(([op, column, value]) => (op === 'eq' ? row[column] === value : String(row[column]) >= String(value))),
    );
    return mode === 'count' ? { count: matches.length, data: null, error: null } : { data: matches, error: null };
  };
  const builder = {
    select: (_columns?: string, options?: { head?: boolean }) => {
      if (options?.head) mode = 'count';
      return builder;
    },
    eq: (column: string, value: unknown) => (filters.push(['eq', column, value]), builder),
    gte: (column: string, value: unknown) => (filters.push(['gte', column, value]), builder),
    limit: () => builder,
    insert: (row: Row) => ((pendingInsert = row), builder),
    update: (row: Row) => ((pendingUpdate = row), builder),
    single: async () => run(),
    maybeSingle: async () => {
      const result = run();
      const data = Array.isArray(result.data) ? (result.data[0] ?? null) : result.data;
      return { ...result, data };
    },
    then: (resolve: (value: unknown) => void) => resolve(run()),
  };
  void table;
  return builder;
}

let configured = true;
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: () => (configured ? { from: query } : null) }));
vi.mock('@/lib/content/get', () => ({ getPublishedSite: async () => mergeSite({}), CONTENT_TAG: 'site-content' }));

const { handleEnquiry } = await import('@/lib/enquiry/handle');

const validQuote = () => ({
  service: 'Objectbewaking',
  location: 'Amsterdam',
  message: 'Graag een voorstel voor objectbewaking van ons kantoor.',
  company: 'Voorbeeld B.V.',
  name: 'Test Aanvrager',
  email: 'Test@Example.nl',
  phone: '+31 6 12345678',
  consent: true,
  website: '',
  startedAt: Date.now() - 60_000,
  token: crypto.randomUUID(),
});

const post = (body: unknown, ip = '203.0.113.7') =>
  new Request('http://localhost/api/offerte', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  db.rows = [];
  db.inserts = [];
  db.updates = [];
  configured = true;
  delete process.env.RESEND_API_KEY;
});

describe('schemas', () => {
  it('requires every client-requested quote field', () => {
    const result = quoteSchema.safeParse({ startedAt: 0, token: crypto.randomUUID(), consent: true });
    expect(result.success).toBe(false);
    const fields = new Set(result.error!.issues.map((issue) => issue.path[0]));
    for (const field of ['company', 'name', 'email', 'phone', 'service', 'location', 'message']) expect(fields.has(field)).toBe(true);
  });

  it('accepts a contact message without company or phone', () => {
    const result = contactSchema.safeParse({ name: 'Jan', email: 'jan@example.nl', message: 'Een vraag over beveiliging.', consent: true, startedAt: 0, token: crypto.randomUUID() });
    expect(result.success).toBe(true);
  });
});

describe('handleEnquiry', () => {
  it('stores a valid quote and normalises the e-mail address', async () => {
    const response = await handleEnquiry('quote', post(validQuote()));
    expect(response.status).toBe(201);
    expect(db.inserts).toHaveLength(1);
    expect(db.inserts[0]).toMatchObject({ kind: 'quote', email: 'test@example.nl', service: 'Objectbewaking', location: 'Amsterdam' });
    expect(String(db.inserts[0].ip_hash)).toMatch(/^[0-9a-f]{64}$/);
    expect(db.updates.at(-1)).toEqual({ email_status: 'not_configured' });
  });

  it('silently drops honeypot submissions', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), website: 'https://spam.example' }));
    expect(response.status).toBe(201);
    expect(db.inserts).toHaveLength(0);
  });

  it('silently drops submissions that are filled in impossibly fast', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), startedAt: Date.now() }));
    expect(response.status).toBe(201);
    expect(db.inserts).toHaveLength(0);
  });

  it('returns field errors for invalid input', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), email: 'geen', location: '' }));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(Object.keys(body.errors)).toEqual(expect.arrayContaining(['email', 'location']));
  });

  it('stores an optional preferred start date and rejects past dates', async () => {
    const future = await handleEnquiry('quote', post({ ...validQuote(), preferredDate: '2099-01-05' }));
    expect(future.status).toBe(422); // more than two years ahead
    const past = await handleEnquiry('quote', post({ ...validQuote(), preferredDate: '2020-01-05' }));
    expect(past.status).toBe(422);
    expect((await past.json()).errors.preferredDate).toBeTruthy();
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    const day = toDay(soon);
    const ok = await handleEnquiry('quote', post({ ...validQuote(), preferredDate: day }));
    expect(ok.status).toBe(201);
    expect(db.inserts.at(-1)).toMatchObject({ preferred_date: day });
  });

  it('stores no start date when none was chosen', async () => {
    await handleEnquiry('quote', post(validQuote()));
    expect(db.inserts.at(-1)).toMatchObject({ preferred_date: null });
  });

  it('rejects services that are not offered', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), service: 'Persoonsbeveiliging' }));
    expect(response.status).toBe(422);
    expect(db.inserts).toHaveLength(0);
  });

  it('answers a retried submission without storing it twice', async () => {
    const body = validQuote();
    await handleEnquiry('quote', post(body));
    const retry = await handleEnquiry('quote', post(body));
    expect(retry.status).toBe(201);
    expect((await retry.json()).duplicate).toBe(true);
    expect(db.inserts).toHaveLength(1);
  });

  it('treats the same message from the same address as a duplicate', async () => {
    await handleEnquiry('quote', post(validQuote()));
    const second = await handleEnquiry('quote', post(validQuote()));
    expect((await second.json()).duplicate).toBe(true);
    expect(db.inserts).toHaveLength(1);
  });

  it('rate limits repeated submissions from one address', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await handleEnquiry('quote', post({ ...validQuote(), message: `Aanvraag nummer ${i} met voldoende tekst.` }));
      expect(response.status).toBe(201);
    }
    const blocked = await handleEnquiry('quote', post({ ...validQuote(), message: 'Nog een aanvraag met voldoende tekst.' }));
    expect(blocked.status).toBe(429);
  });

  it('explains when the form is not connected yet instead of claiming success', async () => {
    configured = false;
    const response = await handleEnquiry('quote', post(validQuote()));
    expect(response.status).toBe(503);
  });

  it('rejects oversized and malformed bodies', async () => {
    const big = await handleEnquiry('contact', post({ ...validQuote(), message: 'x'.repeat(30_000) }));
    expect(big.status).toBe(413);
    const malformed = await handleEnquiry('contact', new Request('http://localhost/api/contact', { method: 'POST', body: '{nope' }));
    expect(malformed.status).toBe(400);
  });
});
