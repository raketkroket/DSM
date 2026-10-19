import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ScrollStatement } from '@/components/motion/ScrollStatement';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { WordReveal } from '@/components/motion/WordReveal';
import { DrawLine } from '@/components/motion/DrawLine';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ClosingCta } from '@/components/site/ClosingCta';
import { JsonLd } from '@/components/site/JsonLd';
import { Photo } from '@/components/site/Photo';
import { breadcrumbJsonLd } from '@/lib/seo';
import type { SiteContent } from '@/lib/content/types';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

export function AboutView({ site }: { site: SiteContent }) {
  const { about, home } = site;
  const words = about.values.title.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <article>
      <ScrollProgress />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Over ons', path: '/over-ons' }])} />

      {/* Hero */}
      <section className="relative pt-32 md:pt-44">
        <div className="shell">
          <div className="intro-fade" style={delay(150)}>
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Over ons' }]} />
          </div>
          <p className="intro-fade eyebrow mt-10" style={delay(220)}>
            {about.hero.eyebrow}
          </p>
          <h1 className="mt-6 text-[clamp(2.9rem,9vw,9.5rem)] leading-[0.9] font-medium tracking-[-0.055em] text-navy">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-rise block" style={delay(300)}>
                {about.hero.title}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.1em] md:pl-[12%]">
              <span className="intro-rise accent block text-navy-soft" style={delay(430)}>
                {about.hero.titleAccent}
              </span>
            </span>
          </h1>
        </div>
        <div className="shell mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-4 md:pt-4">
            <p className="intro-fade-up lead text-ink" style={delay(700)}>
              {about.hero.lead}
            </p>
            <div className="intro-draw-x mt-10 h-px w-full bg-line-strong" style={delay(800)} aria-hidden />
            <p className="intro-fade mt-5 font-mono text-[0.68rem] tracking-[0.16em] text-steel uppercase" style={delay(900)}>
              Dedicated Solution Services → Dedicated Security Management B.V.
            </p>
          </div>
          <div className="intro-unveil relative aspect-[16/11] overflow-hidden rounded-[1.75rem] bg-navy md:col-span-8" style={delay(450)}>
            <div className="intro-settle absolute inset-0" style={delay(450)}>
              <Photo image={about.hero.image} sizes="(min-width: 768px) 64vw, 92vw" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Intro statement */}
      <section aria-labelledby="over-intro" className="py-24 md:py-40">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <ScrollStatement id="over-intro" text={about.intro.title} className="display-lg text-navy" />
          </div>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:self-end">
            {about.intro.paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Development chapters with sticky photograph */}
      <section aria-labelledby="ontwikkeling" className="border-t border-line bg-white py-24 md:py-36">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="eyebrow">{about.origin.eyebrow}</p>
                <h2 id="ontwikkeling" className="display-md mt-6 max-w-[14ch] text-navy">
                  {about.origin.title}
                </h2>
              </Reveal>
              <ImageReveal parallax={6} className="mt-10 aspect-[4/5] rounded-[1.5rem] bg-mist">
                <Photo image={about.origin.image} sizes="(min-width: 1024px) 38vw, 92vw" />
              </ImageReveal>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {about.origin.chapters.map((chapter, index) => (
              <li key={chapter.title} className="relative pb-16 last:pb-0 lg:min-h-[52vh] lg:pb-0">
                <DrawLine />
                <Reveal className="pt-8">
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="mono-label text-steel">{chapter.label}</p>
                    <span className="text-[clamp(3.5rem,7vw,6.5rem)] leading-none font-medium tracking-[-0.06em] text-mist" aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="display-sm mt-2 text-navy">{chapter.title}</h3>
                  <p className="mt-5 max-w-[34rem] text-[1.08rem] leading-relaxed text-muted">{chapter.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Expertise */}
      <section aria-labelledby="expertise" className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-36">
        <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="shell relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow text-steel-soft!">{about.expertise.eyebrow}</p>
              <h2 id="expertise" className="display-lg mt-6 max-w-[16ch]">
                {about.expertise.title}
              </h2>
            </Reveal>
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-white/70 lg:col-span-4 lg:col-start-9 lg:self-end">
              {about.expertise.paragraphs.map((paragraph, index) => (
                <Reveal key={index}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-12">
            <ImageReveal parallax={8} className="aspect-[4/3] rounded-[1.5rem] bg-navy lg:col-span-5 lg:aspect-auto">
              <Photo image={about.expertise.image} sizes="(min-width: 1024px) 40vw, 92vw" />
            </ImageReveal>
            <RevealGroup className="grid gap-px overflow-hidden rounded-[1.5rem] bg-white/10 sm:grid-cols-2 lg:col-span-7">
              {about.expertise.areas.map((area, index) => (
                <RevealItem key={area.title} className="bg-navy-deep p-7 md:p-9">
                  <span className="font-mono text-[0.7rem] text-steel-soft">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-10 text-[1.35rem] font-medium tracking-[-0.025em]">{area.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-white/65">{area.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section aria-label="Missie en visie" className="py-24 md:py-36">
        <div className="shell grid gap-6 lg:grid-cols-2">
          <Reveal className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 shadow-soft md:p-14">
            <p className="eyebrow">01</p>
            <h2 className="display-md mt-8 text-navy">{about.mission.title}</h2>
            <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-muted">
              {about.mission.paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'text-[1.25rem] leading-snug tracking-[-0.015em] text-ink' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12} className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-navy p-8 text-white md:p-14">
            <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
            <p className="eyebrow relative text-steel-soft!">02</p>
            <h2 className="display-md relative mt-8">{about.vision.title}</h2>
            <div className="relative mt-8 space-y-5 text-[1.05rem] leading-relaxed text-white/70">
              {about.vision.paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'accent text-[1.9rem] leading-tight text-white' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="waarden" className="border-y border-line bg-white py-24 md:py-36">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{about.values.eyebrow}</p>
          </Reveal>
          <h2 id="waarden" className="mt-8 flex flex-col text-[clamp(3rem,9.5vw,10rem)] leading-[0.92] font-medium tracking-[-0.06em] text-navy md:flex-row md:flex-wrap md:gap-x-[0.25em]">
            {words.map((word, index) => (
              <WordReveal key={word} as="span" parts={[{ text: word, accent: index === 1 }]} delay={index * 0.12} className={index === 1 ? 'block text-navy-soft' : 'block'} />
            ))}
          </h2>
          <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-muted lg:col-span-6">
              {about.values.paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={index * 0.06}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
              <blockquote className="border-l-2 border-navy pl-6">
                <p className="accent text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight text-navy">“{about.values.statement}”</p>
                <footer className="mt-5 font-mono text-[0.68rem] tracking-[0.16em] text-steel uppercase">Ons uitgangspunt</footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {about.gallery.filter((image) => image.src).length > 0 && (
        <section aria-label="Impressies" className="py-24 md:py-32">
          <div className="shell">
            <Reveal className="flex items-end justify-between gap-6">
              <p className="eyebrow">Impressies</p>
              <p className="font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">
                {String(about.gallery.length).padStart(2, '0')} beelden
              </p>
            </Reveal>
          </div>
          <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(clamp(1rem,4vw,3.5rem),calc((100vw-92rem)/2+3.5rem))] pb-2">
            {about.gallery
              .filter((image) => image.src)
              .map((image, index) => (
                <figure
                  key={`${image.src}-${index}`}
                  className={`relative shrink-0 snap-start overflow-hidden rounded-[1.25rem] bg-mist ${
                    index % 2 === 0 ? 'aspect-[4/5] w-[72vw] sm:w-[34vw] lg:w-[24rem]' : 'aspect-[5/4] w-[86vw] self-end sm:w-[44vw] lg:w-[30rem]'
                  }`}
                >
                  <Photo image={image} sizes="(min-width: 1024px) 30rem, 80vw" />
                  <figcaption className="sr-only">{image.alt}</figcaption>
                </figure>
              ))}
          </div>
        </section>
      )}

      {/* Future */}
      <section aria-labelledby="toekomst" className="pb-24 md:pb-36">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">Toekomst</p>
            <h2 id="toekomst" className="display-md mt-6 max-w-[16ch] text-navy">
              {about.future.title}
            </h2>
          </Reveal>
          <div className="space-y-5 lg:col-span-5 lg:col-start-8 lg:self-end">
            {about.future.paragraphs.map((paragraph, index) => (
              <Reveal key={index}>
                <p className="lead text-ink">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ClosingCta
        title={about.closing.title}
        paragraphs={[about.closing.text]}
        primary={about.closing.cta}
        secondary={{ label: 'Neem contact op', href: '/contact' }}
        image={home.closing.image}
      />
    </article>
  );
}
