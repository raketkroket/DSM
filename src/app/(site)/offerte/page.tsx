import type { Metadata } from 'next';
import { QuoteView } from '@/components/contact/QuoteView';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Offerte aanvragen',
  description:
    'Vraag vrijblijvend een offerte aan voor bouwplaatsbeveiliging, evenementenbeveiliging, objectbewaking, cameratoezicht en andere beveiligingsdiensten.',
  alternates: { canonical: '/offerte' },
};

export default async function QuotePage() {
  const site = await getPublishedSite();
  return <QuoteView site={site} />;
}
