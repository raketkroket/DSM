import type { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Over ons',
  description:
    'Dedicated Security Management B.V. bouwt voort op praktijkervaring in beveiliging, receptiediensten en hospitality, en op ervaring in corporate security en safety.',
  alternates: { canonical: '/over-ons' },
};

export default async function AboutPage() {
  const site = await getPublishedSite();
  return <AboutView site={site} />;
}
