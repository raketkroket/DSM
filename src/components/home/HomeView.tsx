import { Faq } from '@/components/site/Faq';
import { ClosingCta } from '@/components/site/ClosingCta';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/Button';
import type { SiteContent } from '@/lib/content/types';
import { Bespoke } from './Bespoke';
import { Experience } from './Experience';
import { Hero } from './Hero';
import { Philosophy } from './Philosophy';
import { ProcessTimeline } from './ProcessTimeline';
import { Sectors } from './Sectors';
import { SecurityLayers } from './SecurityLayers';
import { ServicesDirectory } from './ServicesDirectory';

export function HomeView({ site }: { site: SiteContent }) {
  const { home, services, faq } = site;
  return (
    <>
      <Hero hero={home.hero} layers={home.layers.items} />
      <Experience experience={home.experience} />
      <Philosophy philosophy={home.philosophy} />

      <section aria-labelledby="diensten-titel" className="py-24 md:py-36">
        <div className="shell">
          <div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 lg:grid-cols-12 lg:gap-6">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow">{home.servicesIntro.eyebrow}</p>
              <h2 id="diensten-titel" className="display-lg mt-6 max-w-[15ch] text-navy">
                {home.servicesIntro.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <p className="text-[1.05rem] leading-relaxed text-muted">{home.servicesIntro.text}</p>
              <div className="mt-6">
                <ButtonLink href="/diensten" variant="secondary">
                  Alle diensten
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <ServicesDirectory
            items={services.items.map(({ slug, title, tagline, summary, image }) => ({ slug, title, tagline, summary, image }))}
          />
        </div>
      </section>

      <SecurityLayers layers={home.layers} />
      <ProcessTimeline process={home.process} />
      <Sectors sectors={home.sectors} />
      <Bespoke bespoke={home.bespoke} />
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
