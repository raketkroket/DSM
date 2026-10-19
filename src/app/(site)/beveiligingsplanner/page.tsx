import type { Metadata } from 'next';
import { PlannerLoader } from '@/components/planner/PlannerLoader';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { JsonLd } from '@/components/site/JsonLd';
import { getPublishedSite } from '@/lib/content/get';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Beveiligingsplanner',
  description:
    'Stel in één minuut uw beveiligingsprofiel samen: kies uw locatie, aandachtspunten en beveiligingsmomenten en zie welke diensten van Dedicated Security Management passen.',
  alternates: { canonical: '/beveiligingsplanner' },
};

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

export default async function PlannerPage() {
  const { services } = await getPublishedSite();
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Beveiligingsplanner', path: '/beveiligingsplanner' }])} />
      <div className="blueprint pointer-events-none absolute inset-x-0 top-0 h-[34rem] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="shell relative">
        <div className="intro-fade" style={delay(150)}>
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Beveiligingsplanner' }]} />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
          <h1 className="display-lg text-navy lg:col-span-7">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-rise block" style={delay(260)}>
                Stel uw beveiliging
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span className="intro-rise accent block text-navy-soft" style={delay(380)}>
                in één minuut samen.
              </span>
            </span>
          </h1>
          <p className="intro-fade-up lead text-muted lg:col-span-4 lg:col-start-9 lg:self-end" style={delay(560)}>
            Kies uw locatie, wat u wilt voorkomen en wanneer beveiliging nodig is. U ziet direct welke diensten passen en kunt uw profiel
            meesturen met een offerteaanvraag.
          </p>
        </div>
        <div className="intro-fade-up mt-14 md:mt-20" style={delay(700)}>
          <PlannerLoader services={services.items.map(({ slug, title, tagline, image }) => ({ slug, title, tagline, image }))} />
        </div>
      </div>
    </section>
  );
}
