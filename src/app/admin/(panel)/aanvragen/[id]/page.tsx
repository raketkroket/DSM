import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { EnquiryControls } from '@/components/admin/EnquiryControls';
import { AdminSkeleton, Badge, Card, CardHeader, KIND_LABEL, PageHeader, STATUS_LABEL, STATUS_TONE, adminButton, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/auth';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = { title: 'Aanvraag' };

const EMAIL_STATUS: Record<string, string> = {
  sent: 'Melding en bevestiging verstuurd',
  failed: 'E-mail versturen mislukt',
  not_configured: 'E-mail niet geconfigureerd',
  pending: 'E-mail in behandeling',
};

async function Detail({ params }: { params: PageProps<'/admin/aanvragen/[id]'>['params'] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: enquiry } = await supabase.from('enquiries').select('*').eq('id', id).maybeSingle();
  if (!enquiry) notFound();
  const { settings } = await getPublishedSite();

  const subject = enquiry.kind === 'quote' ? `Uw offerteaanvraag: ${enquiry.service}` : 'Uw bericht aan Dedicated Security Management';
  const body = `Beste ${enquiry.name},\n\nBedankt voor uw ${enquiry.kind === 'quote' ? 'offerteaanvraag' : 'bericht'}.\n\n\n\nMet vriendelijke groet,\n${settings.companyName}`;
  const mailto = `mailto:${encodeURIComponent(enquiry.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const details = [
    ['Bedrijfsnaam', enquiry.company],
    ['Contactpersoon', enquiry.name],
    ['E-mailadres', enquiry.email],
    ['Telefoonnummer', enquiry.phone],
    ['Gewenste dienst', enquiry.service],
    ['Locatie van de opdracht', enquiry.location],
  ].filter(([, value]) => value);

  return (
    <div className="space-y-6">
      <Link href="/admin/aanvragen" className="inline-flex items-center gap-2 text-[0.88rem] text-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Alle aanvragen
      </Link>
      <PageHeader
        eyebrow={`${KIND_LABEL[enquiry.kind as 'quote' | 'contact']} · ${formatDate(enquiry.created_at)}`}
        title={enquiry.company || enquiry.name}
        actions={
          <>
            <Badge tone={STATUS_TONE[enquiry.status as keyof typeof STATUS_TONE]}>{STATUS_LABEL[enquiry.status as keyof typeof STATUS_LABEL]}</Badge>
            <a href={mailto} className={adminButton('primary')}>
              <Mail className="h-4 w-4" aria-hidden /> Beantwoorden per e-mail
            </a>
            {enquiry.phone && (
              <a href={`tel:${enquiry.phone.replace(/\s/g, '')}`} className={adminButton('secondary')}>
                <Phone className="h-4 w-4" aria-hidden /> Bellen
              </a>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title={enquiry.kind === 'quote' ? 'Omschrijving van de aanvraag' : 'Bericht'} />
            <p className="px-5 py-5 text-[0.98rem] leading-relaxed break-words whitespace-pre-line text-ink">{enquiry.message}</p>
          </Card>
          <Card>
            <CardHeader title="Gegevens" />
            <dl className="divide-y divide-line">
              {details.map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[12rem_1fr]">
                  <dt className="text-[0.85rem] text-muted">{label}</dt>
                  <dd className="text-[0.95rem] break-words text-navy">
                    {label === 'E-mailadres' ? (
                      <a className="hover:underline" href={`mailto:${value}`}>
                        {value}
                      </a>
                    ) : label === 'Telefoonnummer' ? (
                      <a className="hover:underline" href={`tel:${String(value).replace(/\s/g, '')}`}>
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <EnquiryControls id={enquiry.id} status={enquiry.status} notes={enquiry.internal_notes} />
          <Card>
            <CardHeader title="Verwerking" />
            <dl className="space-y-2 px-5 py-4 text-[0.85rem]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Ontvangen</dt>
                <dd className="text-ink">{formatDate(enquiry.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Laatst bijgewerkt</dt>
                <dd className="text-ink">{formatDate(enquiry.updated_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">E-mail</dt>
                <dd className="text-right text-ink">{EMAIL_STATUS[enquiry.email_status] ?? enquiry.email_status}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EnquiryPage({ params }: PageProps<'/admin/aanvragen/[id]'>) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
