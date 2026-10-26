import Link from 'next/link';
import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollStatement } from '@/components/motion/ScrollStatement';
import { ArrowBadge } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';

/** Editorial company introduction: one large statement, a quiet column of facts, one wide image. */
export function Intro({ experience }: { experience: HomeContent['experience'] }) {
  const [statement, ...rest] = experience.paragraphs;
  return (
    <section aria-labelledby="intro-titel" className="bg-paper pt-24 md:pt-40">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="eyebrow">{experience.eyebrow}</p>
              <h2 id="intro-titel" className="mt-6 text-[1.05rem] leading-snug font-medium text-ink">
                {experience.title} <span className="text-muted">{experience.titleAccent}</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-9">
            <ScrollStatement
              as="p"
              text={statement}
              className="font-display text-[clamp(1.6rem,3.7vw,3.6rem)] leading-[1.08] font-medium tracking-[-0.03em] break-words text-navy"
            />
            <div className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-10 md:grid-cols-2 md:gap-12">
              {rest.map((paragraph, index) => (
                <Reveal key={index} delay={index * 0.08}>
                  <p className="text-[1.02rem] leading-relaxed text-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1} className="mt-10">
              <Link href="/over-ons" className="group inline-flex items-center gap-3 border-b border-navy pb-1.5 text-[0.95rem] font-medium text-navy">
                Over Dedicated Security Management <ArrowBadge variant="text" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="shell mt-20 md:mt-28">
        <ImageReveal parallax={8} from="inset(0% 0% 100% 0%)" className="aspect-[16/10] bg-mist md:aspect-[21/8]">
          <Photo image={experience.imagePrimary} sizes="(min-width: 1472px) 1360px, 92vw" />
        </ImageReveal>
      </div>
    </section>
  );
}
