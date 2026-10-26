import Link from 'next/link';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ArrowBadge } from '@/components/site/Button';
import type { HomeContent } from '@/lib/content/types';

/** The five working steps as one calm horizontal sequence (stacked on small screens). */
export function ProcessStrip({ process }: { process: HomeContent['process'] }) {
  return (
    <section aria-labelledby="werkwijze-titel" className="bg-paper py-24 md:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">{process.eyebrow}</p>
            <h2 id="werkwijze-titel" className="display-md mt-6 max-w-[18ch] text-navy">
              {process.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="text-[1.05rem] leading-relaxed text-muted">{process.text}</p>
          </Reveal>
        </div>
        <RevealGroup as="ol" className="mt-16 grid grid-cols-1 border-t border-ink/80 sm:grid-cols-2 lg:grid-cols-5" stagger={0.08}>
          {process.steps.map((step, index) => (
            <RevealItem
              as="li"
              key={step.title}
              className="group relative border-b border-line py-8 pr-6 transition-colors duration-500 sm:[&:nth-child(odd)]:border-r lg:border-r lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="block font-display text-[2.8rem] leading-none font-medium tracking-[-0.05em] text-ink/15 transition-colors duration-500 group-hover:text-navy tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-8 text-[1.12rem] leading-snug font-medium tracking-[-0.015em] text-navy">{step.title}</h3>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{step.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-10">
          <Link href="/beveiligingsplanner" className="group inline-flex items-center gap-3 border-b border-navy pb-1.5 text-[0.95rem] font-medium text-navy">
            Begin met de beveiligingsplanner <ArrowBadge variant="text" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
