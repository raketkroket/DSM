import { Photo } from './Photo';
import { ButtonLink } from './Button';
import { Reveal } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import type { Cta, ImageRef } from '@/lib/content/types';

export function ClosingCta({
  title,
  paragraphs,
  primary,
  secondary,
  image,
}: {
  title: string;
  paragraphs: string[];
  primary: Cta;
  secondary?: Cta;
  image: ImageRef;
}) {
  return (
    <section aria-labelledby="afsluiting-titel" className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0" aria-hidden>
        <Photo image={{ ...image, alt: '' }} sizes="100vw" className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/80 to-navy-deep" />
      </div>
      <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative py-28 md:py-44">
        <div className="mx-auto max-w-[62rem] text-center">
          <Reveal>
            <p className="eyebrow eyebrow-plain justify-center text-steel-soft!">Dedicated Security Management B.V.</p>
          </Reveal>
          <WordReveal id="afsluiting-titel" className="display-lg mt-7" parts={[{ text: title }]} />
          <Reveal delay={0.2}>
            <div className="mx-auto mt-8 max-w-[40rem] space-y-4 text-[1.05rem] leading-relaxed text-white/75">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.3} className="mt-11 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={primary.href} variant="light">
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="ghost-light" arrow={false}>
                {secondary.label}
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
