import { ProcessTimeline } from '@/components/home/ProcessTimeline';
import { ClosingCta } from '@/components/site/ClosingCta';
import { Faq } from '@/components/site/Faq';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { JsonLd } from '@/components/site/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { env } from '@/lib/env';
import type { SiteContent } from '@/lib/content/types';
import { ServiceIndex } from './ServiceIndex';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

export function ServicesOverview({ site }: { site: SiteContent }) {
  const { services, home, faq } = site;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Diensten', path: '/diensten' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: services.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.title,
            url: `${env.siteUrl}/diensten/${item.slug}`,
          })),
        }}
      />
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="blueprint pointer-events-none absolute inset-x-0 top-0 h-full [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="shell relative">
          <div className="intro-fade" style={delay(150)}>
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Diensten' }]} />
          </div>
          <h1 className="mt-10 max-w-[18ch] display-xl text-navy">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-rise block" style={delay(260)}>
                {services.title}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span className="intro-rise accent block text-navy-soft" style={delay(380)}>
                {services.titleAccent}
              </span>
            </span>
          </h1>
          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <p className="intro-fade-up lead text-muted md:col-span-6" style={delay(620)}>
              {services.intro}
            </p>
            <p className="intro-fade-up font-mono text-[0.7rem] tracking-[0.16em] text-steel uppercase md:col-span-3 md:col-start-10 md:self-end md:text-right" style={delay(700)}>
              {String(services.items.length).padStart(2, '0')} diensten
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Overzicht van diensten" className="pb-24 md:pb-36">
        <div className="shell">
          <ServiceIndex items={services.items} />
        </div>
      </section>

      <div className="border-t border-line">
        <ProcessTimeline process={home.process} />
      </div>
      <div className="border-t border-line bg-white">
        <Faq faq={faq} />
      </div>
      <ClosingCta
        title={home.closing.title}
        paragraphs={home.closing.paragraphs}
        primary={home.closing.primaryCta}
        secondary={home.closing.secondaryCta}
        image={home.closing.image}
      />
    </>
  );
}
