import { ClosingCta } from '@/components/site/ClosingCta';
import { Faq } from '@/components/site/Faq';
import type { SiteContent } from '@/lib/content/types';
import { AboutStory } from './AboutStory';
import { Hero } from './Hero';
import { Intro } from './Intro';
import { PlannerTeaser } from './PlannerTeaser';
import { ProcessStrip } from './ProcessStrip';
import { ServicesShowcase } from './ServicesShowcase';
import { StatementBand } from './StatementBand';
import { WhyDsm } from './WhyDsm';

/**
 * Homepage rhythm: photographic hero → light editorial intro → services → photographic pause →
 * why DSM → process → story → planner → questions → closing invitation.
 */
export function HomeView({ site }: { site: SiteContent }) {
  const { home, services, faq } = site;
  return (
    <>
      <Hero hero={home.hero} />
      <Intro experience={home.experience} />
      <ServicesShowcase
        intro={home.servicesIntro}
        items={services.items.map(({ slug, title, tagline, image }) => ({ slug, title, tagline, image }))}
      />
      <StatementBand eyebrow={home.philosophy.eyebrow} statement={home.philosophy.statement} image={home.philosophy.image} />
      <WhyDsm why={home.why} />
      <ProcessStrip process={home.process} />
      <AboutStory experience={home.experience} />
      <PlannerTeaser />
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
