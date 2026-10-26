import Link from 'next/link';
import { ArrowBadge, buttonClass } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';
import { HeroParallax } from './HeroParallax';
import { fitTitle } from '@/lib/fit';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/** Splits a line into words that each rise from their own mask (pure CSS, so it plays before hydration). */
function RisingWords({ text, start, step = 45 }: { text: string; start: number; step?: number }) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word, index, words) => (
      <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span className="intro-rise inline-block" style={delay(start + index * step)}>
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      </span>
    ));
}

/**
 * Full-bleed editorial hero. The photograph settles from a slight zoom and drifts on scroll;
 * the headline rises word by word; supporting copy and actions follow in a measured sequence.
 */
export function Hero({ hero }: { hero: HomeContent['hero'] }) {
  return (
    <section aria-labelledby="hero-titel" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy-deep text-white">
      {/* On wide screens the portrait photograph keeps its composition on the right two-thirds. */}
      <div className="absolute inset-y-0 right-0 left-0 -z-10 overflow-hidden lg:left-[30%]">
        <HeroParallax>
          <div className="intro-settle absolute inset-0" style={delay(0)}>
            <Photo image={hero.image} sizes="(min-width: 1024px) 70vw, 100vw" priority grade={false} className="grayscale-[35%]" />
          </div>
        </HeroParallax>
        <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-navy-deep to-transparent lg:block" aria-hidden />
      </div>
      {/* Legibility: a calm left-to-right falloff plus a floor gradient, no colour tint. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/80 via-navy-deep/35 to-transparent lg:from-navy-deep/60" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" aria-hidden />

      <div className="shell flex flex-1 flex-col justify-end pt-32 pb-10 md:pb-14">
        <p className="intro-fade mono-label text-white/65" style={delay(80)}>
          {hero.eyebrow}
        </p>
        <h1
          id="hero-titel"
          className="fit-title mt-6 max-w-[15ch] font-display leading-[0.92] font-medium tracking-[-0.045em] [--fit-w:178vw] lg:[--fit-w:min(176vw,2600px)]"
          style={fitTitle(`${hero.title} ${hero.titleAccent}`, 8.5)}
        >
          <span className="block">
            <RisingWords text={hero.title} start={120} />
          </span>
          <span className="block text-white/55">
            <RisingWords text={hero.titleAccent} start={220} />
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-12 lg:items-end">
          <p className="intro-fade-up max-w-[34rem] text-[1.08rem] leading-relaxed text-white/78 md:text-[1.2rem] lg:col-span-6" style={delay(600)}>
            {hero.lead}
          </p>
          <div className="intro-fade-up flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end" style={delay(720)}>
            <Link href={hero.primaryCta.href} className={buttonClass('light')}>
              <span>{hero.primaryCta.label}</span>
              <ArrowBadge />
            </Link>
            <Link href={hero.secondaryCta.href} className={buttonClass('ghost-light')}>
              <span>{hero.secondaryCta.label}</span>
            </Link>
          </div>
        </div>

        <div className="intro-fade mt-12 flex items-center justify-between gap-6 border-t border-white/20 pt-5 text-[0.8rem] text-white/60 md:mt-16" style={delay(950)}>
          <span className="flex items-center gap-3">
            <span className="relative block h-8 w-px overflow-hidden bg-white/25" aria-hidden>
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[dsm-scroll-cue_2.2s_var(--ease-soft)_infinite] bg-white" />
            </span>
            Scroll
          </span>
          <span className="hidden sm:block">{hero.caption}</span>
          <span className="hidden tracking-[0.12em] uppercase md:block">Professioneel · Alert · Betrokken</span>
        </div>
      </div>
    </section>
  );
}
