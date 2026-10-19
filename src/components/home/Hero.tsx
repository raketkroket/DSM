import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { ArrowBadge, buttonClass } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';
import { HeroParallax } from './HeroParallax';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/** Inverted fillet that makes the editorial panel read as carved out of the photograph. */
function Fillet({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-7 w-7 ${className}`}
      style={{ background: 'radial-gradient(circle at 100% 0, transparent 27.5px, var(--color-paper) 28px)' }}
    />
  );
}

export function Hero({ hero, layers }: { hero: HomeContent['hero']; layers: HomeContent['layers']['items'] }) {
  return (
    <section aria-labelledby="hero-titel" className="relative overflow-hidden pt-[5.5rem] md:pt-24">
      <div className="shell">
        <div className="relative">
          {/* Photograph */}
          <div
            className="intro-unveil-up relative h-[46svh] min-h-[18rem] overflow-hidden rounded-[1.75rem] bg-navy md:h-[calc(100svh-7.5rem)] md:min-h-[38rem] md:max-h-[58rem]"
            style={delay(120)}
          >
            <HeroParallax>
              <div className="intro-settle absolute inset-0" style={delay(120)}>
                <Photo image={hero.image} sizes="(min-width: 1472px) 1400px, 96vw" priority />
              </div>
            </HeroParallax>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/45 via-transparent to-navy-deep/10" aria-hidden />

            {/* Caption card */}
            <div
              className="intro-fade-up absolute top-24 right-4 hidden max-w-[17rem] rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-md md:top-auto md:right-6 md:bottom-6 md:block"
              style={delay(1300)}
            >
              <p className="mono-label text-white/60">Dedicated Security Management</p>
              <p className="mt-2 text-[0.95rem] leading-snug">{hero.caption}</p>
            </div>
          </div>

          {/* Editorial panel */}
          <div className="relative z-10 -mt-14 rounded-t-[1.75rem] bg-paper pt-7 md:absolute md:bottom-0 md:left-0 md:mt-0 md:w-[min(64%,58rem)] md:rounded-tl-none md:rounded-tr-[1.75rem] md:pt-10 md:pr-12">
            <Fillet className="-top-7 left-0 hidden md:block" />
            <Fillet className="bottom-0 left-full hidden md:block" />

            <p className="intro-fade eyebrow" style={delay(380)}>
              {hero.eyebrow}
            </p>
            <h1 id="hero-titel" className="mt-5 text-[clamp(2.6rem,6.1vw,6.1rem)] leading-[0.95] font-medium tracking-[-0.045em] text-navy">
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="intro-rise block" style={delay(460)}>
                  {hero.title}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <span className="intro-rise accent block text-navy-soft" style={delay(580)}>
                  {hero.titleAccent}
                </span>
              </span>
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
              <p className="intro-fade-up lead max-w-[34rem] text-muted" style={delay(820)}>
                {hero.lead}
              </p>
            </div>
            <div className="intro-fade-up mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap" style={delay(960)}>
              <Link href={hero.primaryCta.href} className={buttonClass('primary', 'pr-2.5')}>
                <span>{hero.primaryCta.label}</span>
                <ArrowBadge />
              </Link>
              <Link href={hero.secondaryCta.href} className={buttonClass('secondary')}>
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>

        {/* Lower band */}
        <div className="grid grid-cols-1 gap-10 border-b border-line py-12 md:mt-14 md:grid-cols-12 md:py-14">
          <div className="intro-fade md:col-span-6 lg:col-span-5" style={delay(1150)}>
            <p className="text-[1.05rem] leading-relaxed text-ink/80">{hero.body}</p>
          </div>
          <nav aria-label="Beveiliging in lagen" className="intro-fade md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7" style={delay(1250)}>
            <ol className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {layers.map((layer, index) => (
                <li key={layer.title} className="bg-paper">
                  <a href="#lagen" className="group flex h-full flex-col justify-between gap-6 p-4 transition-colors hover:bg-white md:p-5">
                    <span className="font-mono text-[0.68rem] text-steel">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[0.8rem] font-medium break-words text-navy xs:text-[0.95rem] md:text-base">{layer.title}</span>
                  </a>
                </li>
              ))}
            </ol>
            <a href="#ervaring" className="mt-5 inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.16em] text-muted uppercase hover:text-navy">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll verder
            </a>
          </nav>
        </div>
      </div>
    </section>
  );
}
