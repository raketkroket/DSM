import Link from 'next/link';
import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { ArrowBadge, ButtonLink } from './Button';
import { Photo } from './Photo';
import type { Cta, ImageRef } from '@/lib/content/types';

const ROUTES = [
  { href: '/offerte', label: 'Offerte aanvragen', text: 'Vertel ons over uw locatie en wensen.' },
  { href: '/beveiligingsplanner', label: 'Beveiligingsplanner', text: 'Stel in één minuut uw profiel samen.' },
  { href: '/contact', label: 'Contact', text: 'Een vraag of eerst kennismaken?' },
];

/** Closing invitation: a confident statement, the photograph alongside, three clear routes onward. */
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
    <section aria-labelledby="afsluiting-titel" className="bg-navy-deep text-white">
      <div className="shell grid grid-cols-1 gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7 lg:pr-10">
          <Reveal>
            <p className="mono-label text-white/65">Dedicated Security Management B.V.</p>
          </Reveal>
          <WordReveal id="afsluiting-titel" className="display-lg mt-7 max-w-[14ch]" parts={[{ text: title }]} />
          <Reveal delay={0.2}>
            <div className="mt-8 max-w-[36rem] space-y-4 text-[1.05rem] leading-relaxed text-white/70">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-col gap-3 sm:flex-row">
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
        <div className="lg:col-span-5">
          <ImageReveal parallax={6} from="inset(100% 0% 0% 0%)" className="aspect-[4/5] bg-navy">
            <Photo image={{ ...image, alt: '' }} sizes="(min-width: 1024px) 38vw, 92vw" />
          </ImageReveal>
        </div>
      </div>
      <nav aria-label="Vervolgstappen" className="border-t border-white/12">
        <div className="shell grid grid-cols-1 md:grid-cols-3">
          {ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group flex items-center justify-between gap-6 border-b border-white/12 py-7 transition-colors md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
            >
              <span>
                <span className="block font-display text-[1.25rem] font-medium tracking-[-0.02em]">{route.label}</span>
                <span className="mt-1 block text-[0.9rem] text-white/65">{route.text}</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-white/25 transition-colors duration-500 group-hover:bg-white group-hover:text-navy">
                <ArrowBadge />
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
