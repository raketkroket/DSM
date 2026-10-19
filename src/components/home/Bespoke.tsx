import { Check } from 'lucide-react';
import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';

export function Bespoke({ bespoke }: { bespoke: HomeContent['bespoke'] }) {
  return (
    <section aria-labelledby="maatwerk-titel" className="relative pb-24 md:pb-36">
      <div className="shell relative">
        <ImageReveal parallax={7} from="inset(0% 0% 0% 100%)" className="h-[24rem] rounded-[1.75rem] bg-navy md:h-[44rem]">
          <Photo image={bespoke.image} sizes="96vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/50 to-transparent" aria-hidden />
        </ImageReveal>

        <Reveal className="relative z-10 -mt-24 ml-auto w-full rounded-[1.5rem] bg-white p-7 shadow-panel sm:p-10 md:-mt-[28rem] md:mr-10 md:w-[min(36rem,60%)] md:p-12 lg:mr-16">
          <p className="eyebrow">{bespoke.eyebrow}</p>
          <h2 id="maatwerk-titel" className="display-sm mt-5 text-navy">
            {bespoke.title}
          </h2>
          <div className="prose-dsm mt-5 text-[1rem] leading-relaxed text-muted">
            {bespoke.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <RevealGroup as="ul" className="mt-7 grid gap-x-6 gap-y-3 border-t border-line pt-7 sm:grid-cols-2">
            {bespoke.factors.map((factor) => (
              <RevealItem as="li" key={factor} className="flex gap-3 text-[0.92rem] leading-snug text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel" aria-hidden />
                {factor}
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="mt-7 text-[0.95rem] text-ink">{bespoke.closing}</p>
          <div className="mt-7">
            <ButtonLink href="/diensten/beveiliging-op-maat">Bekijk beveiliging op maat</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
