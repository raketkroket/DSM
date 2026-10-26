import type { Metadata } from 'next';
import { ContactView } from '@/components/contact/ContactView';
import { getPublicAvailability } from '@/lib/availability-server';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Neem vrijblijvend contact op met Dedicated Security Management B.V. en ontdek welke beveiligingsoplossing aansluit bij uw situatie.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const [site, availability] = await Promise.all([getPublishedSite(), getPublicAvailability()]);
  return <ContactView site={site} availability={availability} />;
}
