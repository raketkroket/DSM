import 'server-only';
import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { getPublishedSite } from '@/lib/content/get';
import { env } from '@/lib/env';
import { createServiceClient } from '@/lib/supabase/service';
import { confirmationEmail, notificationEmail } from './email';
import { contactSchema, fieldErrors, MIN_FILL_MS, OTHER_SERVICE, quoteSchema } from './schema';

type Kind = 'quote' | 'contact';

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX = 5;
const DUPLICATE_WINDOW_HOURS = 24;

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

  const site = await getPublishedSite();
  if (kind === 'quote') {
    const allowed = new Set([...site.services.items.map((item) => item.title), OTHER_SERVICE]);
    if (!allowed.has(service)) {
      return json(422, { message: 'Controleer de gemarkeerde velden.', errors: { service: 'Kies een dienst uit de lijst.' } });
    }
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return json(503, {
      message: 'Het online formulier is nog niet gekoppeld. Neem tijdelijk rechtstreeks contact met ons op.',
    });
  }

  const salt = process.env.ENQUIRY_HASH_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const ipHash = sha256(`${salt}:${clientIp(request)}`);
  const email = data.email.toLowerCase();
  const fingerprint = sha256(`${kind}:${email}:${data.message.replace(/\s+/g, ' ').toLowerCase()}`);

  // Retried submission (double click, network retry): already stored, answer the same way.
  const { data: existing } = await supabase.from('enquiries').select('id').eq('submission_token', data.token).maybeSingle();
  if (existing) return json(201, { message: SUCCESS[kind], duplicate: true });

  const since = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

  const { count: recentFromIp } = await supabase
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since(RATE_LIMIT_WINDOW_MINUTES));
  if ((recentFromIp ?? 0) >= RATE_LIMIT_MAX) {
    return json(429, { message: 'U heeft te veel aanvragen verstuurd. Probeer het over enkele minuten opnieuw.' });
  }

  const { data: sameContent } = await supabase
    .from('enquiries')
    .select('id')
    .eq('fingerprint', fingerprint)
    .gte('created_at', since(DUPLICATE_WINDOW_HOURS * 60))
    .limit(1);
  if (sameContent && sameContent.length > 0) {
    return json(201, { message: SUCCESS[kind], duplicate: true });
  }

  const record = {
    kind,
    company: data.company ?? '',
    name: data.name,
    email,
    phone: data.phone ?? '',
    service,
    location,
    message: data.message,
    submission_token: data.token,
    fingerprint,
    ip_hash: ipHash,
  };

  const { data: inserted, error } = await supabase.from('enquiries').insert(record).select('id').single();
  if (error || !inserted) {
    // A concurrent retry with the same token hits the unique constraint: that request already succeeded.
    if (error?.code === '23505') return json(201, { message: SUCCESS[kind], duplicate: true });
    console.error('Aanvraag opslaan mislukt:', error?.message);
    return json(500, { message: 'De aanvraag kon niet worden opgeslagen. Probeer het later opnieuw.' });
  }

  const emailStatus = await sendEmails(kind, record, inserted.id, site.settings);
  await supabase.from('enquiries').update({ email_status: emailStatus }).eq('id', inserted.id);

  return json(201, { message: SUCCESS[kind] });
}

async function sendEmails(
  kind: Kind,
  record: { company: string; name: string; email: string; phone: string; service: string; location: string; message: string },
  id: string,
  settings: { companyName: string; notificationEmail: string; email: string },
): Promise<'sent' | 'failed' | 'not_configured'> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const recipient = settings.notificationEmail || process.env.ENQUIRY_NOTIFICATION_EMAIL || '';
  if (!apiKey || !from || !recipient) return 'not_configured';

  const rows = [
    { label: 'Bedrijfsnaam', value: record.company },
    { label: 'Naam', value: record.name },
    { label: 'E-mailadres', value: record.email },
    { label: 'Telefoonnummer', value: record.phone },
    { label: 'Gewenste dienst', value: record.service },
    { label: 'Locatie', value: record.location },
    { label: kind === 'quote' ? 'Omschrijving' : 'Bericht', value: record.message },
  ];
  const resend = new Resend(apiKey);
  const subject = kind === 'quote' ? 'Nieuwe offerteaanvraag' : 'Nieuw contactbericht';

  try {
    const notification = await resend.emails.send({
      from,
      to: recipient,
      replyTo: record.email,
      subject: `${subject} — ${record.company || record.name}`,
      html: notificationEmail({ kind, rows, adminUrl: `${env.siteUrl}/admin/aanvragen/${id}`, company: settings.companyName }),
    });
    if (notification.error) {
      console.error('Notificatie versturen mislukt:', notification.error.message);
      return 'failed';
    }
    const confirmation = await resend.emails.send({
      from,
      to: record.email,
      ...(settings.email ? { replyTo: settings.email } : {}),
      subject: kind === 'quote' ? `Bevestiging van uw offerteaanvraag | ${settings.companyName}` : `Wij hebben uw bericht ontvangen | ${settings.companyName}`,
      html: confirmationEmail({ kind, name: record.name, rows, company: settings.companyName }),
    });
    if (confirmation.error) console.error('Bevestiging versturen mislukt:', confirmation.error.message);
    return 'sent';
  } catch (error) {
    console.error('E-mail versturen mislukt:', error instanceof Error ? error.message : error);
    return 'failed';
  }
}
