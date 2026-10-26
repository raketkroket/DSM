import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Circle, FileText, Image as ImageIcon, Mail, Settings } from 'lucide-react';
import { AdminSkeleton, Badge, Card, CardHeader, PageHeader, formatDate } from '@/components/admin/ui';
import { PublishAllButton } from '@/components/admin/PublishAllButton';
import { requireAdmin } from '@/lib/admin/auth';
import { getSectionStates, type SectionStates } from '@/lib/admin/content';
import { SECTION_META } from '@/lib/admin/editor-spec';
import { SECTION_KEYS } from '@/lib/content/types';
import { STOCK_PREFIX } from '@/lib/content/photos';
import { isRedisConfigured } from '@/lib/server/kv';

export const metadata: Metadata = { title: 'Dashboard' };

type Check = { label: string; ok: boolean; detail: string };

async function Dashboard() {
  const { storage } = await requireAdmin();
  let states: SectionStates | null = null;
  let storageCheck = { read: 'ontbreekt', write: 'ontbreekt' };
  if (storage) {
    [states, storageCheck] = await Promise.all([getSectionStates(storage).catch(() => null), storage.check()]);
  }
  const pending = states ? SECTION_KEYS.filter((key) => states[key].pending) : [];
  const settings = states?.settings.published;
  const recipient = settings?.notificationEmail || process.env.ENQUIRY_NOTIFICATION_EMAIL || '';
  const storageOk = storageCheck.read === 'ok' && storageCheck.write === 'ok';

  const checks: Check[] = [
    {
      label: 'Opslag',
      ok: storageOk,
      detail: !storage
        ? 'Niet gekoppeld: stel GITHUB_CONTENT_TOKEN in. Wijzigingen kunnen nu niet worden bewaard.'
        : storage.kind === 'local'
          ? 'Lokaal (ontwikkelomgeving): wijzigingen worden in deze map bewaard.'
          : storageOk
            ? 'GitHub: elke wijziging wordt bewaard; na publiceren is de website binnen één à twee minuten bijgewerkt.'
            : `GitHub geeft een fout (lezen: ${storageCheck.read}, schrijven: ${storageCheck.write}). Controleer het token.`,
    },
    {
      label: 'E-mail voor aanvragen',
      ok: Boolean(process.env.RESEND_API_KEY && recipient),
      detail: !process.env.RESEND_API_KEY
        ? 'Niet gekoppeld: stel RESEND_API_KEY in. Bezoekers krijgen nu de melding dat het formulier nog niet werkt.'
        : recipient
          ? `Aanvragen worden gemaild naar ${recipient}.`
          : 'Vul bij Instellingen → Meldingen het e-mailadres voor nieuwe aanvragen in.',
    },
    {
      label: 'Beveiliging tegen misbruik',
      ok: true,
      detail: isRedisConfigured()
        ? 'Upstash Redis: inlogpogingen en formulieren worden over alle servers heen beperkt.'
        : 'Basisbeveiliging per server. Aanbevolen voor livegang: koppel gratis Upstash Redis.',
    },
  ];

  const setup = [
    { done: Boolean(settings?.email || settings?.phone), label: 'Contactgegevens ingevuld', href: '/admin/instellingen' },
    { done: Boolean(recipient), label: 'E-mailadres voor aanvragen ingesteld', href: '/admin/instellingen' },
    { done: Boolean(states) && !JSON.stringify(SECTION_KEYS.map((key) => states![key].published)).includes(STOCK_PREFIX), label: 'Tijdelijke stockfoto’s vervangen', href: '/admin/fotos' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overzicht"
        title="Dashboard"
        description="De stand van de website, wijzigingen die nog gepubliceerd moeten worden en snelkoppelingen."
        actions={pending.length > 0 ? <PublishAllButton count={pending.length} /> : undefined}
      />

      {!storage && (
        <p role="alert" className="flex gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-[0.9rem] text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          De opslag is nog niet gekoppeld, dus wijzigingen kunnen niet worden bewaard. Neem contact op met uw websitebouwer.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {checks.map((check) => (
          <div key={check.label} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.95rem] font-medium text-navy">{check.label}</p>
              <Badge tone={check.ok ? 'success' : 'warning'}>{check.ok ? 'In orde' : 'Actie nodig'}</Badge>
            </div>
            <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">{check.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Website-inhoud" description={pending.length ? `${pending.length} onderde${pending.length === 1 ? 'el' : 'len'} met niet-gepubliceerde wijzigingen` : 'Alles is gepubliceerd'} />
          {states ? (
            <ul className="divide-y divide-line">
              {SECTION_KEYS.map((key) => (
                <li key={key}>
                  <Link href={key === 'settings' ? '/admin/instellingen' : `/admin/content/${key}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                    <span className="text-[0.92rem] text-ink">{SECTION_META[key].label}</span>
                    {states[key].pending ? <Badge tone="warning">Concept</Badge> : <span className="text-[0.78rem] text-muted">{states[key].publishedAt ? formatDate(states[key].publishedAt, false) : 'Standaardtekst'}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-[0.9rem] text-muted">De inhoud kan niet worden geladen zolang de opslag niet werkt.</p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Inrichting" description="Controlelijst voor livegang" />
            <ul className="space-y-1 p-3">
              {setup.map((item) => {
                const content = (
                  <>
                    {item.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden /> : <Circle className="h-4 w-4 shrink-0 text-line-strong" aria-hidden />}
                    <span className={item.done ? 'text-muted line-through decoration-line-strong' : 'text-ink'}>{item.label}</span>
                    <span className="sr-only">{item.done ? '(gereed)' : '(open)'}</span>
                  </>
                );
                return (
                  <li key={item.label}>
                    {!item.done ? (
                      <Link href={item.href} className="flex items-center gap-3 rounded-lg px-2 py-2 text-[0.88rem] hover:bg-paper">
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-2 py-2 text-[0.88rem]">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            {[
              { href: '/admin/content/home', label: 'Homepagina', icon: FileText },
              { href: '/admin/beschikbaarheid', label: 'Beschikbaarheid', icon: CalendarDays },
              { href: '/admin/media', label: 'Foto’s', icon: ImageIcon },
              { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[0.85rem] text-navy hover:border-navy">
                <Icon className="h-4 w-4 text-steel" aria-hidden />
                {label}
              </Link>
            ))}
          </div>

          <p className="flex gap-3 text-[0.82rem] leading-relaxed text-muted">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-steel" aria-hidden />
            Offerteaanvragen en contactberichten komen per e-mail binnen. Met Beantwoorden in uw mailprogramma antwoordt u de klant direct.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
