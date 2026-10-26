import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';

/** The company's development, told as three chapters along a single line. */
export function AboutStory({ experience }: { experience: HomeContent['experience'] }) {
  return (
    <section aria-labelledby="verhaal-titel" className="bg-paper py-24 md:py-36">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">Ons verhaal</p>
            <h2 id="verhaal-titel" className="display-lg mt-6 text-navy">
              {experience.title} <span className="accent">{experience.titleAccent}</span>
            </h2>
          </Reveal>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <ImageReveal parallax={5} from="inset(0% 100% 0% 0%)" className="aspect-[3/2] bg-mist">
              <Photo image={experience.imageSecondary} sizes="(min-width: 1024px) 36vw, 92vw" />
            </ImageReveal>
          </div>
        </div>
        <RevealGroup as="ol" className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-3 md:gap-6" stagger={0.1}>
          {experience.milestones.map((milestone, index) => (
            <RevealItem as="li" key={milestone.title} className="relative border-t border-ink/80 pt-6">
              <span
                className={`absolute -top-[5px] left-0 h-[9px] w-[9px] ${index === experience.milestones.length - 1 ? 'bg-navy' : 'border border-ink bg-paper'}`}
                aria-hidden
              />
              <p className="mono-label text-muted">{milestone.label}</p>
              <h3 className="mt-4 text-[1.4rem] leading-tight font-medium tracking-[-0.02em] text-navy">{milestone.title}</h3>
              <p className="mt-3 max-w-[24rem] leading-relaxed text-muted">{milestone.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-14">
          <ButtonLink href="/over-ons" variant="secondary">
            Lees ons volledige verhaal
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
