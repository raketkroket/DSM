import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { DrawLine } from '@/components/motion/DrawLine';
import { Photo } from '@/components/site/Photo';
import { ButtonLink } from '@/components/site/Button';
import type { HomeContent } from '@/lib/content/types';

export function Experience({ experience }: { experience: HomeContent['experience'] }) {
  return (
    <section id="ervaring" aria-labelledby="ervaring-titel" className="relative py-24 md:py-36">
      <div className="shell">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">{experience.eyebrow}</p>
            </Reveal>
            <WordReveal
              id="ervaring-titel"
              className="display-lg mt-6 text-navy"
              parts={[{ text: experience.title }, { text: experience.titleAccent, accent: true }]}
            />
            <div className="mt-10 max-w-[34rem] space-y-5 text-[1.05rem] leading-relaxed text-ink/80">
              {experience.paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={index * 0.08}>
                  <p className={index === 0 ? 'lead text-ink' : ''}>{paragraph}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2} className="mt-10">
              <ButtonLink href="/over-ons" variant="secondary">
                Meer over ons
              </ButtonLink>
            </Reveal>
          </div>

          {/* Layered photography */}
          <div className="relative lg:col-span-6 lg:col-start-7">
            <ImageReveal parallax={6} className="aspect-[4/5] rounded-[1.5rem] bg-mist lg:ml-[12%]">
              <Photo image={experience.imagePrimary} sizes="(min-width: 1024px) 42vw, 92vw" />
            </ImageReveal>
            <ImageReveal
              parallax={10}
              delay={0.25}
              from="inset(0% 0% 100% 0%)"
              className="absolute -bottom-10 -left-2 aspect-square w-[46%] rounded-[1.25rem] border-[6px] border-paper bg-mist shadow-panel md:-left-6 lg:-left-[8%]"
            >
              <Photo image={experience.imageSecondary} sizes="(min-width: 1024px) 20vw, 44vw" />
            </ImageReveal>
          </div>
        </div>

        {/* Development line */}
        <div className="relative mt-28 md:mt-36">
          <DrawLine className="absolute top-[0.3rem] right-0 left-0 hidden md:block" />
          <RevealGroup as="ol" className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {experience.milestones.map((milestone, index) => (
              <RevealItem as="li" key={milestone.title} className="relative md:pt-10">
                <span className="absolute top-0 left-0 hidden h-[0.6rem] w-[0.6rem] rounded-full border border-navy bg-paper md:block" aria-hidden>
                  {index === experience.milestones.length - 1 && <span className="absolute inset-[2px] rounded-full bg-navy" />}
                </span>
                <p className="mono-label text-steel">{milestone.label}</p>
                <h3 className="display-sm mt-3 text-navy">{milestone.title}</h3>
                <p className="mt-3 max-w-[26rem] leading-relaxed text-muted">{milestone.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
