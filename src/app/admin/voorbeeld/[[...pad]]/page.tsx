import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Eye } from 'lucide-react';
import { AboutView } from '@/components/about/AboutView';
import { ContactView } from '@/components/contact/ContactView';
import { QuoteView } from '@/components/contact/QuoteView';
import { HomeView } from '@/components/home/HomeView';
import { ServiceView } from '@/components/service/ServiceView';
import { ServicesOverview } from '@/components/service/ServicesOverview';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { requireAdmin } from '@/lib/admin/auth';
import { getDraftSite } from '@/lib/admin/content';
import type { SiteContent } from '@/lib/content/types';
import { STOCK_PREFIX } from '@/lib/content/photos';

export const metadata: Metadata = { title: 'Voorbeeld', robots: { index: false, follow: false } };

function View({ site, path }: { site: SiteContent; path: string[] }) {
  const [first, second] = path;
  if (!first) return <HomeView site={site} />;
  if (first === 'diensten' && !second) return <ServicesOverview site={site} />;
  if (first === 'diensten' && second) {
    const index = site.services.items.findIndex((item) => item.slug === second);
    if (index === -1) notFound();
    return <ServiceView service={site.services.items[index]} index={index} site={site} />;
  }
  if (first === 'over-ons') return <AboutView site={site} />;
  if (first === 'contact') return <ContactView site={site} />;
  if (first === 'offerte') return <QuoteView site={site} />;
  notFound();
}

async function Preview({ params }: { params: PageProps<'/admin/voorbeeld/[[...pad]]'>['params'] }) {
  const { pad = [] } = await params;
  const { supabase } = await requireAdmin();
  const site = await getDraftSite(supabase);
  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full bg-navy-deep py-2 pr-2 pl-4 text-[0.82rem] text-white shadow-panel">
        <Eye className="h-4 w-4 text-steel-soft" aria-hidden />
        <span>Voorbeeld met niet-gepubliceerde wijzigingen</span>
        <Link href="/admin/content" className="rounded-full bg-white px-3 py-1.5 text-navy">
          Terug naar beheer
        </Link>
      </div>
      <Header
        services={site.services.items.map(({ slug, title, summary, image }) => ({ slug, title, summary, image }))}
        logo={site.settings.logo}
        email={site.settings.email}
        phone={site.settings.phone}
      />
      <main id="inhoud">
        <View site={site} path={pad} />
      </main>
      <Footer settings={site.settings} services={site.services.items} stockPhotos={JSON.stringify(site).includes(STOCK_PREFIX)} />
    </>
  );
}

export default function PreviewPage({ params }: PageProps<'/admin/voorbeeld/[[...pad]]'>) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center text-muted">Voorbeeld laden…</div>}>
      <Preview params={params} />
    </Suspense>
  );
}
