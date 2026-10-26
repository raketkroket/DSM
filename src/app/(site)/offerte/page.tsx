import type { Metadata } from 'next';
import { QuoteView } from '@/components/contact/QuoteView';
import { getPublicAvailability } from '@/lib/availability-server';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Offerte aanvragen',
  description:
    'Vraag vrijblijvend een offerte aan voor bouwplaatsbeveiliging, evenementenbeveiliging, objectbewaking, cameratoezicht en andere beveiligingsdiensten.',
  alternates: { canonical: '/offerte' },
};

export default async function QuotePage() {
  const [site, availability] = await Promise.all([getPublishedSite(), getPublicAvailability()]);
  return <QuoteView site={site} availability={availability} />;
}
