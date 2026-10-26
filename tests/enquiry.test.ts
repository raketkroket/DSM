import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toDay } from '@/lib/availability';
import { mergeSite } from '@/lib/content/merge';
import { contactSchema, quoteSchema } from '@/lib/enquiry/schema';
import { resetMemoryStore } from '@/lib/server/kv';

/* ── Fake Resend: records every e-mail; the owner notification can be made to fail ── */
type Mail = { from: string; to: string; replyTo?: string; subject: string; html: string };
const mail: { sent: Mail[]; failNotification: boolean; failConfirmation: boolean } = { sent: [], failNotification: false, failConfirmation: false };

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (message: Mail) => {
        const toOwner = message.to === 'eigenaar@example.nl';
        if ((toOwner && mail.failNotification) || (!toOwner && mail.failConfirmation)) return { data: null, error: { message: 'refused' } };
        mail.sent.push(message);
        return { data: { id: 'x' }, error: null };
      },
    };
  },
}));
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

const toOwner = () => mail.sent.filter((message) => message.to === 'eigenaar@example.nl');

beforeEach(() => {
  mail.sent = [];
  mail.failNotification = false;
  mail.failConfirmation = false;
  resetMemoryStore();
  process.env.RESEND_API_KEY = 're_test';
  process.env.ENQUIRY_NOTIFICATION_EMAIL = 'eigenaar@example.nl';
  delete process.env.RESEND_FROM_EMAIL;
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
  it('e-mails a valid quote to the owner, with the customer as reply-to, and confirms to the customer', async () => {
    const response = await handleEnquiry('quote', post(validQuote()));
    expect(response.status).toBe(201);
    const [notification] = toOwner();
    expect(notification.replyTo).toBe('test@example.nl');
    expect(notification.subject).toContain('Voorbeeld B.V.');
    expect(notification.html).toContain('Objectbewaking');
    expect(notification.html).toContain('nergens anders bewaard');
    expect(notification.from).toContain('onboarding@resend.dev');
    expect(mail.sent.some((message) => message.to === 'test@example.nl')).toBe(true);
  });

  it('escapes what visitors type before putting it in the e-mail', async () => {
    await handleEnquiry('quote', post({ ...validQuote(), message: '<script>alert(1)</script> met voldoende tekst' }));
    expect(toOwner()[0].html).not.toContain('<script>');
  });

  it('tells the visitor when the e-mail could not be sent, and allows a retry', async () => {
    mail.failNotification = true;
    const body = validQuote();
    const failed = await handleEnquiry('quote', post(body));
    expect(failed.status).toBe(502);
    mail.failNotification = false;
    const retry = await handleEnquiry('quote', post(body));
    expect(retry.status).toBe(201);
    expect(toOwner()).toHaveLength(1);
  });

  it('still succeeds when only the confirmation to the customer is refused', async () => {
    mail.failConfirmation = true;
    const response = await handleEnquiry('quote', post(validQuote()));
    expect(response.status).toBe(201);
    expect(toOwner()).toHaveLength(1);
  });

  it('explains when the form is not connected yet instead of claiming success', async () => {
    delete process.env.RESEND_API_KEY;
    expect((await handleEnquiry('quote', post(validQuote()))).status).toBe(503);
    process.env.RESEND_API_KEY = 're_test';
    delete process.env.ENQUIRY_NOTIFICATION_EMAIL;
    expect((await handleEnquiry('quote', post(validQuote()))).status).toBe(503);
  });

  it('silently drops honeypot and impossibly fast submissions', async () => {
    expect((await handleEnquiry('quote', post({ ...validQuote(), website: 'https://spam.example' }))).status).toBe(201);
    expect((await handleEnquiry('quote', post({ ...validQuote(), startedAt: Date.now() }))).status).toBe(201);
    expect(mail.sent).toHaveLength(0);
  });

  it('returns field errors for invalid input', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), email: 'geen', location: '' }));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(Object.keys(body.errors)).toEqual(expect.arrayContaining(['email', 'location']));
  });

  it('rejects services that are not offered', async () => {
    const response = await handleEnquiry('quote', post({ ...validQuote(), service: 'Persoonsbeveiliging' }));
    expect(response.status).toBe(422);
    expect(mail.sent).toHaveLength(0);
  });

  it('includes an optional preferred start date and rejects past or far-off dates', async () => {
    expect((await handleEnquiry('quote', post({ ...validQuote(), preferredDate: '2099-01-05' }))).status).toBe(422);
    const past = await handleEnquiry('quote', post({ ...validQuote(), preferredDate: '2020-01-05' }));
    expect(past.status).toBe(422);
    expect((await past.json()).errors.preferredDate).toBeTruthy();
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    const ok = await handleEnquiry('quote', post({ ...validQuote(), preferredDate: toDay(soon) }));
    expect(ok.status).toBe(201);
    expect(toOwner()[0].html).toContain('Gewenste startdatum');
  });

  it('answers a retried submission without sending it twice', async () => {
    const body = validQuote();
    await handleEnquiry('quote', post(body));
    const retry = await handleEnquiry('quote', post(body));
    expect(retry.status).toBe(201);
    expect((await retry.json()).duplicate).toBe(true);
    expect(toOwner()).toHaveLength(1);
  });

  it('treats the same message from the same address as a duplicate', async () => {
    await handleEnquiry('quote', post(validQuote()));
    const second = await handleEnquiry('quote', post(validQuote()));
    expect((await second.json()).duplicate).toBe(true);
    expect(toOwner()).toHaveLength(1);
  });

  it('rate limits repeated submissions from one address', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await handleEnquiry('quote', post({ ...validQuote(), message: `Aanvraag nummer ${i} met voldoende tekst.` }));
      expect(response.status).toBe(201);
    }
    const blocked = await handleEnquiry('quote', post({ ...validQuote(), message: 'Nog een aanvraag met voldoende tekst.' }));
    expect(blocked.status).toBe(429);
    const otherAddress = await handleEnquiry('quote', post({ ...validQuote(), message: 'Een aanvraag van iemand anders.' }, '198.51.100.4'));
    expect(otherAddress.status).toBe(201);
  });

  it('rejects oversized and malformed bodies', async () => {
    const big = await handleEnquiry('contact', post({ ...validQuote(), message: 'x'.repeat(30_000) }));
    expect(big.status).toBe(413);
    const malformed = await handleEnquiry('contact', new Request('http://localhost/api/contact', { method: 'POST', body: '{nope' }));
    expect(malformed.status).toBe(400);
  });
});
