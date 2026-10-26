import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { getPublishedSite } from '@/lib/content/get';
import { organizationJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/site/JsonLd';
import { STOCK_PREFIX } from '@/lib/content/photos';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const site = await getPublishedSite();
  const { settings, services } = site;
  return (
    <>
      <JsonLd data={organizationJsonLd(site)} />
      <Header
        services={services.items.map(({ slug, title, summary, image }) => ({ slug, title, summary, image }))}
        logo={settings.logo}
        email={settings.email}
        phone={settings.phone}
      />
      <main id="inhoud">{children}</main>
      <Footer settings={settings} services={services.items} stockPhotos={JSON.stringify(site).includes(STOCK_PREFIX)} />
    </>
  );
}
