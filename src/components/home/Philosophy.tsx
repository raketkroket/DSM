import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ScrollStatement } from '@/components/motion/ScrollStatement';
import { DrawLine } from '@/components/motion/DrawLine';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';

export function Philosophy({ philosophy }: { philosophy: HomeContent['philosophy'] }) {
  return (
    <section aria-labelledby="filosofie-titel" className="relative overflow-hidden bg-navy-deep text-white">
      <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative pt-24 pb-20 md:pt-36 md:pb-28">
        <Reveal>
          <p className="eyebrow text-steel-soft!">{philosophy.eyebrow}</p>
        </Reveal>
        <ScrollStatement
          id="filosofie-titel"
          text={philosophy.statement}
          className="mt-8 max-w-[20ch] text-[clamp(2.4rem,6.4vw,6.4rem)] leading-[0.98] font-medium tracking-[-0.045em]"
        />

        <div className="mt-20 grid gap-14 md:mt-28 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-white/70 lg:col-span-5">
            {philosophy.paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08}>
                <p className={index === 0 ? 'lead text-white/90' : ''}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="mono-label text-white/45">Onze uitgangspunten</p>
            </Reveal>
            <RevealGroup as="ol" className="mt-6">
              {philosophy.principles.map((principle, index) => (
                <RevealItem as="li" key={principle} className="relative">
                  <DrawLine tone="light" />
                  <div className="flex items-baseline gap-6 py-5">
                    <span className="font-mono text-[0.7rem] text-steel-soft">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[1.15rem] leading-snug tracking-[-0.015em] text-white md:text-[1.3rem]">{principle}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <DrawLine tone="light" />
          </div>
        </div>
      </div>

      <div className="shell relative pb-6">
        <ImageReveal parallax={8} from="inset(0% 50% 0% 50%)" className="aspect-[16/10] rounded-[1.5rem] bg-navy md:aspect-[21/8]">
          <Photo image={philosophy.image} sizes="96vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 to-transparent" aria-hidden />
        </ImageReveal>
      </div>
      <div className="h-16 md:h-24" aria-hidden />
    </section>
  );
}
