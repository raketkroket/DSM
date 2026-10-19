import type { Metadata } from 'next';
import { ServicesOverview } from '@/components/service/ServicesOverview';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Diensten',
  description:
    'Bouwplaatsbeveiliging, evenementenbeveiliging, receptiediensten, recreatiebeveiliging, objectbewaking, winkelsurveillance, cameratoezicht, beveiliging op maat en risicoanalyses.',
  alternates: { canonical: '/diensten' },
};

export default async function ServicesPage() {
  const site = await getPublishedSite();
  return <ServicesOverview site={site} />;
}
