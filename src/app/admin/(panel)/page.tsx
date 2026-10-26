import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, CheckCircle2, Circle, FileText, Image as ImageIcon, Inbox, Mail, Settings } from 'lucide-react';
import { AdminSkeleton, Badge, Card, CardHeader, EmptyState, KIND_LABEL, PageHeader, STATUS_LABEL, STATUS_TONE, formatDate } from '@/components/admin/ui';
import { PublishAllButton } from '@/components/admin/PublishAllButton';
import { requireAdmin } from '@/lib/admin/auth';
import { getSectionStates } from '@/lib/admin/content';
import { SECTION_META } from '@/lib/admin/editor-spec';
import { SECTION_KEYS } from '@/lib/content/types';
import { STOCK_PREFIX } from '@/lib/content/photos';

export const metadata: Metadata = { title: 'Dashboard' };

type EnquiryRow = { id: string; kind: 'quote' | 'contact'; status: 'new' | 'contacted' | 'completed'; name: string; company: string; service: string; created_at: string };

async function Dashboard({ searchParams }: { searchParams: PageProps<'/admin'>['searchParams'] }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const [states, recent, newQuotes, newMessages, open] = await Promise.all([
    getSectionStates(supabase),
    supabase.from('enquiries').select('id, kind, status, name, company, service, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('kind', 'quote').eq('status', 'new'),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('kind', 'contact').eq('status', 'new'),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).neq('status', 'completed'),
  ]);
  const enquiries = (recent.data ?? []) as EnquiryRow[];
  const pending = SECTION_KEYS.filter((key) => states[key].pending);
  const settings = states.settings.published;

  const setup = [
    { done: Boolean(settings.email || settings.phone), label: 'Contactgegevens ingevuld', href: '/admin/instellingen' },
    { done: Boolean(settings.notificationEmail || process.env.ENQUIRY_NOTIFICATION_EMAIL), label: 'E-mailadres voor meldingen ingesteld', href: '/admin/instellingen' },
    { done: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL), label: 'E-mailverzending (Resend) gekoppeld', href: null },
    { done: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), label: 'Formulieren gekoppeld aan de database', href: null },
    { done: !JSON.stringify(SECTION_KEYS.map((key) => states[key].published)).includes(STOCK_PREFIX), label: 'Tijdelijke stockfoto’s vervangen', href: '/admin/fotos' },
  ];

  const stats = [
    { label: 'Nieuwe offerteaanvragen', value: newQuotes.count ?? 0, href: '/admin/aanvragen?status=new&soort=quote', icon: Inbox },
    { label: 'Nieuwe berichten', value: newMessages.count ?? 0, href: '/admin/aanvragen?status=new&soort=contact', icon: Mail },
    { label: 'Openstaand in behandeling', value: open.count ?? 0, href: '/admin/aanvragen?status=open', icon: CheckCircle2 },
    { label: 'Onderdelen met concept', value: pending.length, href: '/admin/content', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overzicht"
        title="Dashboard"
        description="Nieuwe aanvragen, wijzigingen die nog gepubliceerd moeten worden en snelkoppelingen."
        actions={pending.length > 0 ? <PublishAllButton count={pending.length} /> : undefined}
      />
      {params.wachtwoord === 'gewijzigd' && (
        <p role="status" className="rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-[0.9rem] text-success">
          Uw wachtwoord is gewijzigd.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy">
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-steel" aria-hidden />
              <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
            <p className="mt-6 text-[2.2rem] leading-none font-medium tracking-[-0.04em] text-navy">{value}</p>
            <p className="mt-2 text-[0.88rem] text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Recente aanvragen"
            description="Offerteaanvragen en contactberichten"
            action={
              <Link href="/admin/aanvragen" className="text-[0.85rem] text-steel hover:text-navy">
                Alles bekijken
              </Link>
            }
          />
          {enquiries.length === 0 ? (
            <EmptyState icon={<Inbox className="h-5 w-5" />} title="Nog geen aanvragen" text="Zodra iemand het offerte- of contactformulier invult, verschijnt de aanvraag hier." />
          ) : (
            <ul className="divide-y divide-line">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link href={`/admin/aanvragen/${enquiry.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.95rem] font-medium text-navy">{enquiry.company || enquiry.name}</p>
                      <p className="truncate text-[0.82rem] text-muted">
                        {KIND_LABEL[enquiry.kind]}
                        {enquiry.service ? ` · ${enquiry.service}` : ''} · {formatDate(enquiry.created_at)}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[enquiry.status]}>{STATUS_LABEL[enquiry.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Website-inhoud" description={pending.length ? `${pending.length} onderdeel/onderdelen met niet-gepubliceerde wijzigingen` : 'Alles is gepubliceerd'} />
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
          </Card>

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
                    {item.href && !item.done ? (
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

          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/admin/content/home', label: 'Homepagina', icon: FileText },
              { href: '/admin/media', label: 'Foto’s', icon: ImageIcon },
              { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[0.85rem] text-navy hover:border-navy">
                <Icon className="h-4 w-4 text-steel" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}
