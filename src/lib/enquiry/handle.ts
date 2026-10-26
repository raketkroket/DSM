import 'server-only';
import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { formatDay, preferredDateIssue, todayInAmsterdam } from '@/lib/availability';
import { getPublishedSite } from '@/lib/content/get';
import { claim, hit, release } from '@/lib/server/kv';
import { confirmationEmail, notificationEmail } from './email';
import { contactSchema, fieldErrors, MIN_FILL_MS, OTHER_SERVICE, quoteSchema } from './schema';

type Kind = 'quote' | 'contact';

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW = 15 * 60; // seconds
const RATE_LIMIT_MAX = 5;
const DUPLICATE_WINDOW = 24 * 60 * 60; // seconds
// Resend's shared test sender: works without a verified domain, but only to the Resend account's own address.
const FALLBACK_FROM = 'Dedicated Security Management <onboarding@resend.dev>';

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

const SUCCESS = {
  quote: 'Bedankt. Wij hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op.',
  contact: 'Bedankt. Wij hebben uw bericht ontvangen en nemen zo snel mogelijk contact met u op.',
};
const SEND_FAILED = 'Uw aanvraag kon op dit moment niet worden verzonden. Probeer het later opnieuw of neem telefonisch of per e-mail contact met ons op.';

/**
 * Handles a form submission without a database: the request is validated and e-mailed to the
 * owner (Resend), with a confirmation to the sender. If the e-mail cannot be sent, the visitor
 * is told so instead of being shown a success message.
 */
export async function handleEnquiry(kind: Kind, request: Request): Promise<Response> {
  const length = Number(request.headers.get('content-length') ?? '0');
  if (length > MAX_BODY_BYTES) return json(413, { message: 'De aanvraag is te groot.' });

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { message: 'De aanvraag is te groot.' });
    payload = JSON.parse(raw);
  } catch {
    return json(400, { message: 'De aanvraag kon niet worden verwerkt.' });
  }

  // Bots: a filled honeypot or an impossibly fast submission is accepted silently and dropped.
  const probe = payload as { website?: unknown; startedAt?: unknown };
  if (typeof probe.website === 'string' && probe.website.trim() !== '') {
    return json(201, { message: SUCCESS[kind] });
  }
  if (typeof probe.startedAt === 'number' && Date.now() - probe.startedAt < MIN_FILL_MS) {
    return json(201, { message: SUCCESS[kind] });
  }

  const parsed = kind === 'quote' ? quoteSchema.safeParse(payload) : contactSchema.safeParse(payload);
  if (!parsed.success) {
    return json(422, { message: 'Controleer de gemarkeerde velden.', errors: fieldErrors(parsed.error) });
  }
  const data = parsed.data;
  const service = 'service' in data ? String(data.service) : '';
  const location = 'location' in data ? String(data.location) : '';
  const preferredDate = 'preferredDate' in data ? String(data.preferredDate ?? '') : '';
  const dateIssue = preferredDateIssue(preferredDate, todayInAmsterdam());
  if (dateIssue) return json(422, { message: 'Controleer de gemarkeerde velden.', errors: { preferredDate: dateIssue } });

  const site = await getPublishedSite();
  if (kind === 'quote') {
    const allowed = new Set([...site.services.items.map((item) => item.title), OTHER_SERVICE]);
    if (!allowed.has(service)) {
      return json(422, { message: 'Controleer de gemarkeerde velden.', errors: { service: 'Kies een dienst uit de lijst.' } });
    }
  }

  const recipient = site.settings.notificationEmail || process.env.ENQUIRY_NOTIFICATION_EMAIL || '';
  if (!process.env.RESEND_API_KEY || !recipient) {
    return json(503, { message: 'Het online formulier is nog niet gekoppeld. Neem tijdelijk rechtstreeks contact met ons op.' });
  }

  const salt = process.env.ENQUIRY_HASH_SALT ?? process.env.ADMIN_SESSION_SECRET ?? '';
  const ipKey = `dsm:form:ip:${sha256(`${salt}:${clientIp(request)}`).slice(0, 32)}`;
  const email = data.email.toLowerCase();
  const tokenKey = `dsm:form:token:${data.token}`;
  const contentKey = `dsm:form:content:${sha256(`${kind}:${email}:${data.message.replace(/\s+/g, ' ').toLowerCase()}`).slice(0, 32)}`;

  try {
    // Retried submission (double click, network retry): already sent, answer the same way.
    if (!(await claim(tokenKey, DUPLICATE_WINDOW))) return json(201, { message: SUCCESS[kind], duplicate: true });
    // The same message from the same address within a day is not sent twice.
    if (!(await claim(contentKey, DUPLICATE_WINDOW))) return json(201, { message: SUCCESS[kind], duplicate: true });
    const { count } = await hit(ipKey, RATE_LIMIT_WINDOW);
    if (count > RATE_LIMIT_MAX) {
      await Promise.all([release(tokenKey), release(contentKey)]);
      return json(429, { message: 'U heeft te veel aanvragen verstuurd. Probeer het over enkele minuten opnieuw.' });
    }
  } catch (error) {
    // The limits are a safeguard; a storage hiccup must not block a real customer.
    console.error('Formulierbeveiliging niet bereikbaar:', error instanceof Error ? error.message : error);
  }

  const record = {
    company: data.company ?? '',
    name: data.name,
    email,
    phone: data.phone ?? '',
    service,
    location,
    preferredDate,
    message: data.message,
  };
  const sent = await sendEmails(kind, record, recipient, site.settings);
  if (!sent) {
    // Let the visitor try again.
    await Promise.all([release(tokenKey), release(contentKey)]).catch(() => {});
    return json(502, { message: SEND_FAILED });
  }
  return json(201, { message: SUCCESS[kind] });
}

async function sendEmails(
  kind: Kind,
  record: { company: string; name: string; email: string; phone: string; service: string; location: string; preferredDate: string; message: string },
  recipient: string,
  settings: { companyName: string; email: string },
): Promise<boolean> {
  const from = process.env.RESEND_FROM_EMAIL || FALLBACK_FROM;
  const rows = [
    { label: 'Bedrijfsnaam', value: record.company },
    { label: 'Naam', value: record.name },
    { label: 'E-mailadres', value: record.email },
    { label: 'Telefoonnummer', value: record.phone },
    { label: 'Gewenste dienst', value: record.service },
    { label: 'Locatie', value: record.location },
    { label: 'Gewenste startdatum', value: record.preferredDate ? formatDay(record.preferredDate) : '' },
    { label: kind === 'quote' ? 'Omschrijving' : 'Bericht', value: record.message },
  ];
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = kind === 'quote' ? 'Nieuwe offerteaanvraag' : 'Nieuw contactbericht';

  try {
    const notification = await resend.emails.send({
      from,
      to: recipient,
      replyTo: record.email,
      subject: `${subject} — ${record.company || record.name}`,
      html: notificationEmail({ kind, rows, replyTo: record.email, company: settings.companyName }),
    });
    if (notification.error) {
      console.error('Melding versturen mislukt:', notification.error.message);
      return false;
    }
  } catch (error) {
    console.error('Melding versturen mislukt:', error instanceof Error ? error.message : error);
    return false;
  }

  // The confirmation is a courtesy: without a verified sender domain Resend refuses it, which is fine.
  try {
    const confirmation = await resend.emails.send({
      from,
      to: record.email,
      ...(settings.email ? { replyTo: settings.email } : {}),
      subject: kind === 'quote' ? `Bevestiging van uw offerteaanvraag | ${settings.companyName}` : `Wij hebben uw bericht ontvangen | ${settings.companyName}`,
      html: confirmationEmail({ kind, name: record.name, rows, company: settings.companyName }),
    });
    if (confirmation.error) console.warn('Bevestiging niet verstuurd:', confirmation.error.message);
  } catch (error) {
    console.warn('Bevestiging niet verstuurd:', error instanceof Error ? error.message : error);
  }
  return true;
}
