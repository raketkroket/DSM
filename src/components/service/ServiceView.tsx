import Link from 'next/link';
import { Info } from 'lucide-react';
import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { DrawLine } from '@/components/motion/DrawLine';
import { ArrowBadge, ButtonLink } from '@/components/site/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { JsonLd } from '@/components/site/JsonLd';
import { Photo } from '@/components/site/Photo';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo';
import { fitTitle } from '@/lib/fit';
import type { ServiceContent, SiteContent } from '@/lib/content/types';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

type Props = { service: ServiceContent; index: number; site: SiteContent };

function crumbs(service: ServiceContent) {
  return [
    { name: 'Home', href: '/' },
    { name: 'Diensten', href: '/diensten' },
    { name: service.shortTitle },
  ];
}

function ServiceNumber({ index, total, light }: { index: number; total: number; light?: boolean }) {
  return (
    <span className={`font-mono text-[0.7rem] tracking-[0.16em] ${light ? 'text-white/60' : 'text-steel'}`}>
      DIENST {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
  );
}

/* ── Hero A: cinematic full-bleed with carved editorial panel ── */
function HeroFrame({ service, index, total }: { service: ServiceContent; index: number; total: number }) {
  return (
    <section className="pt-[5.5rem] md:pt-24">
      <div className="shell">
        <div className="relative">
          <div className="intro-unveil-up relative h-[56svh] min-h-[22rem] overflow-hidden rounded-[1.75rem] bg-navy md:h-[78svh] md:max-h-[50rem]" style={delay(100)}>
            <div className="intro-settle absolute inset-0" style={delay(100)}>
              <Photo image={service.image} sizes="96vw" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 to-transparent" aria-hidden />
          </div>
          <div className="relative z-10 -mt-12 rounded-t-[1.75rem] bg-paper pt-7 md:absolute md:bottom-0 md:left-0 md:mt-0 md:max-w-[52rem] md:rounded-tl-none md:rounded-tr-[1.75rem] md:pt-9 md:pr-12">
            <div className="intro-fade" style={delay(300)}>
              <Breadcrumbs items={crumbs(service)} />
            </div>
            <h1 className="fit-title mt-6 leading-[0.96] font-medium tracking-[-0.045em] text-navy [--fit-w:165vw] md:[--fit-w:min(112vw,1400px)]" style={fitTitle(service.title, 7.25)}>
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="intro-rise block" style={delay(420)}>
                  {service.title}
                </span>
              </span>
            </h1>
            <p className="intro-fade-up accent mt-4 text-[clamp(1.4rem,2.4vw,2.2rem)] leading-tight text-navy-soft" style={delay(650)}>
              {service.tagline}
            </p>
            <div className="intro-fade mt-6" style={delay(800)}>
              <ServiceNumber index={index} total={total} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hero B: editorial split with layered portrait photography ── */
function HeroSplit({ service, index, total }: { service: ServiceContent; index: number; total: number }) {
  return (
    <section className="pt-28 md:pt-36">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col lg:col-span-6 lg:pt-10">
          <div className="intro-fade" style={delay(200)}>
            <Breadcrumbs items={crumbs(service)} />
          </div>
          <h1 className="fit-title mt-8 leading-[0.96] font-medium tracking-[-0.045em] text-navy [--fit-w:165vw] lg:[--fit-w:min(80vw,1180px)]" style={fitTitle(service.title, 7.25)}>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="intro-rise block" style={delay(320)}>
                {service.title}
              </span>
            </span>
          </h1>
          <p className="intro-fade-up accent mt-5 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.4rem)] leading-tight text-navy-soft" style={delay(560)}>
            {service.tagline}
          </p>
          <p className="intro-fade-up lead mt-8 max-w-[34rem] text-muted" style={delay(700)}>
            {service.summary}
          </p>
          <div className="intro-fade-up mt-auto flex items-center gap-6 pt-10" style={delay(850)}>
            <ButtonLink href={`/offerte?dienst=${service.slug}`}>Offerte aanvragen</ButtonLink>
            <ServiceNumber index={index} total={total} />
          </div>
        </div>
        <div className="relative lg:col-span-5 lg:col-start-8">
          <div className="intro-unveil-up relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-navy" style={delay(150)}>
            <div className="intro-settle absolute inset-0" style={delay(150)}>
              <Photo image={service.image} sizes="(min-width: 1024px) 40vw, 92vw" priority />
            </div>
          </div>
          <div className="intro-unveil absolute -bottom-8 -left-4 hidden aspect-[4/3] w-[52%] overflow-hidden rounded-[1.1rem] border-[6px] border-paper bg-mist shadow-panel sm:block lg:-left-[22%]" style={delay(700)}>
            <Photo image={service.detailImage} sizes="22vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hero C: typographic statement over a blueprint, cinematic band below ── */
function HeroType({ service, index, total }: { service: ServiceContent; index: number; total: number }) {
  return (
    <section className="relative pt-28 md:pt-40">
      <div className="blueprint pointer-events-none absolute inset-x-0 top-0 h-[70%] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="shell relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="intro-fade" style={delay(200)}>
            <Breadcrumbs items={crumbs(service)} />
          </div>
          <div className="intro-fade" style={delay(260)}>
            <ServiceNumber index={index} total={total} />
          </div>
        </div>
        <h1 className="fit-title mt-10 max-w-[18ch] leading-[0.92] font-medium tracking-[-0.05em] text-navy [--fit-w:165vw] md:[--fit-w:min(150vw,2400px)]" style={fitTitle(service.title, 8.5)}>
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="intro-rise block" style={delay(320)}>
              {service.title}
            </span>
          </span>
        </h1>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="intro-fade-up accent text-[clamp(1.5rem,2.6vw,2.4rem)] leading-tight text-navy-soft md:col-span-6" style={delay(560)}>
            {service.tagline}
          </p>
          <p className="intro-fade-up lead text-muted md:col-span-5 md:col-start-8" style={delay(700)}>
            {service.summary}
          </p>
        </div>
        <div className="intro-unveil relative mt-14 aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-navy md:aspect-[21/8]" style={delay(500)}>
          <div className="intro-settle absolute inset-0" style={delay(500)}>
            <Photo image={service.image} sizes="96vw" priority />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Activities: three distinct treatments ── */
function ActivitiesRows({ service }: { service: ServiceContent }) {
  return (
    <section aria-labelledby="werkzaamheden" className="py-24 md:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow">Werkzaamheden</p>
              <h2 id="werkzaamheden" className="display-md mt-6 text-navy">
                {service.activitiesTitle}
              </h2>
            </Reveal>
          </div>
        </div>
        <RevealGroup as="ol" className="lg:col-span-7 lg:col-start-6">
          {service.activities.map((activity, i) => (
            <RevealItem as="li" key={activity} className="group border-b border-line first:border-t">
              <div className="flex items-baseline gap-6 py-6 md:gap-10">
                <span className="font-mono text-[0.7rem] text-steel">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[1.15rem] leading-snug tracking-[-0.015em] text-ink transition-transform duration-700 ease-[var(--ease-arch)] group-hover:translate-x-2 md:text-[1.4rem]">
                  {activity}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ActivitiesCards({ service }: { service: ServiceContent }) {
  return (
    <section aria-labelledby="werkzaamheden" className="bg-mist/60 py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">Werkzaamheden</p>
            <h2 id="werkzaamheden" className="display-md mt-6 text-navy">
              {service.activitiesTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">
              {String(service.activities.length).padStart(2, '0')} onderdelen
            </p>
          </Reveal>
        </div>
        <RevealGroup as="ol" className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.activities.map((activity, i) => (
            <RevealItem
              as="li"
              key={activity}
              className="group relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[1.25rem] border border-white bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-700 ease-[var(--ease-arch)] hover:-translate-y-1 hover:shadow-panel"
            >
              <span className="font-mono text-[0.7rem] text-steel">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-8 text-[1.1rem] leading-snug tracking-[-0.015em] text-navy">{activity}</span>
              <span className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-steel-wash transition-transform duration-700 group-hover:translate-x-5 group-hover:-translate-y-5" aria-hidden />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ActivitiesDark({ service }: { service: ServiceContent }) {
  return (
    <section aria-labelledby="werkzaamheden" className="relative overflow-hidden bg-navy-deep py-24 text-white md:py-32">
      <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-steel-soft!">Werkzaamheden</p>
            <h2 id="werkzaamheden" className="display-md mt-6">
              {service.activitiesTitle}
            </h2>
          </Reveal>
          <ImageReveal parallax={6} className="mt-12 hidden aspect-[4/3] rounded-[1.25rem] bg-navy lg:block">
            <Photo image={service.detailImage} sizes="36vw" />
          </ImageReveal>
        </div>
        <RevealGroup as="ol" className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {service.activities.map((activity, i) => (
            <RevealItem as="li" key={activity} className="border-t border-white/12 py-6">
              <span className="font-mono text-[0.7rem] text-steel-soft">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-[1.08rem] leading-snug text-white/90">{activity}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function ServiceView({ service, index, site }: Props) {
  const all = site.services.items;
  const total = all.length;
  const variant = index % 3;
  const related = [1, 2, 3].map((offset) => all[(index + offset) % total]);

  return (
    <article>
      <ScrollProgress />
      <JsonLd data={serviceJsonLd(service, site)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Diensten', path: '/diensten' },
          { name: service.title, path: `/diensten/${service.slug}` },
        ])}
      />

      {variant === 0 && <HeroFrame service={service} index={index} total={total} />}
      {variant === 1 && <HeroSplit service={service} index={index} total={total} />}
      {variant === 2 && <HeroType service={service} index={index} total={total} />}

      {/* Introduction */}
      <section aria-labelledby="introductie" className="py-24 md:py-32">
        <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <h2 id="introductie" className="sr-only">
              Over {service.title.toLowerCase()}
            </h2>
            <div className="space-y-6">
              {service.intro.map((paragraph, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className={i === 0 ? 'text-[clamp(1.35rem,2vw,1.85rem)] leading-[1.35] tracking-[-0.02em] text-navy' : 'text-[1.05rem] leading-relaxed text-muted'}>
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
            {variant !== 1 && (
              <Reveal delay={0.2} className="mt-10">
                <ButtonLink href={`/offerte?dienst=${service.slug}`}>Vraag een offerte aan</ButtonLink>
              </Reveal>
            )}
          </div>
          <div className="lg:col-span-5 lg:row-start-1">
            <Reveal>
              <p className="eyebrow">Waarom het ertoe doet</p>
            </Reveal>
            <RevealGroup as="ul" className="mt-8 space-y-0">
              {service.importance.map((point, i) => (
                <RevealItem as="li" key={point} className="relative">
                  <DrawLine />
                  <div className="flex gap-5 py-5">
                    <span className="mt-1 font-mono text-[0.68rem] text-steel">{String.fromCharCode(65 + i)}</span>
                    <p className="text-[1.02rem] leading-relaxed text-ink">{point}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {variant === 0 && <ActivitiesRows service={service} />}
      {variant === 1 && <ActivitiesCards service={service} />}
      {variant === 2 && <ActivitiesDark service={service} />}

      {/* Audience */}
      <section aria-labelledby="doelgroep" className="py-24 md:py-32">
        <div className="shell grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-6">
          <div className={`lg:col-span-6 ${variant === 2 ? 'lg:col-start-7' : ''}`}>
            <Reveal>
              <p className="eyebrow">{service.audienceTitle}</p>
            </Reveal>
            <WordReveal id="doelgroep" className="display-sm mt-6 max-w-[24ch] text-navy" parts={[{ text: service.audience }]} stagger={0.025} />
            {service.note && (
              <Reveal delay={0.15} className="mt-10 flex gap-4 rounded-[1.25rem] border border-line bg-white p-6 shadow-soft">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-steel" aria-hidden />
                <p className="text-[0.98rem] leading-relaxed text-ink">{service.note}</p>
              </Reveal>
            )}
          </div>
          <div className={`lg:col-span-5 ${variant === 2 ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-8'}`}>
            {variant === 2 ? (
              <ImageReveal parallax={6} className="aspect-[4/3] rounded-[1.5rem] bg-mist">
                <Photo image={service.image} sizes="(min-width: 1024px) 40vw, 92vw" />
              </ImageReveal>
            ) : (
              <ImageReveal parallax={6} className="aspect-[4/5] rounded-[1.5rem] bg-mist">
                <Photo image={variant === 0 ? service.detailImage : service.image} sizes="(min-width: 1024px) 40vw, 92vw" />
              </ImageReveal>
            )}
          </div>
        </div>
      </section>

      {/* Quote CTA */}
      <section aria-labelledby="dienst-cta" className="pb-24 md:pb-32">
        <div className="shell">
          <Reveal className="relative overflow-hidden rounded-[1.75rem] bg-navy px-6 py-14 text-white sm:px-12 md:px-16 md:py-20">
            <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-steel-soft!">Vrijblijvend advies</p>
                <h2
                  id="dienst-cta"
                  className="fit-title mt-6 leading-[1.04] font-medium tracking-[-0.035em] [--fit-w:135vw] lg:[--fit-w:min(74vw,1000px)]"
                  style={fitTitle(service.title, 3.4)}
                >
                  {service.title} voor uw organisatie?
                </h2>
                <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-relaxed text-white/70">
                  Vertel ons over uw locatie en wensen. Op basis van uw aanvraag bespreken wij welke aanpak passend is.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
                <ButtonLink href={`/offerte?dienst=${service.slug}`} variant="light">
                  Vraag vrijblijvend een offerte aan
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost-light" arrow={false}>
                  Neem contact op
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="gerelateerd" className="border-t border-line bg-white py-24 md:py-32">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="eyebrow">Gerelateerde diensten</p>
              <h2 id="gerelateerd" className="display-sm mt-5 text-navy">
                Vaak gecombineerd
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/diensten" className="group inline-flex items-center gap-3 text-sm font-medium text-navy">
                Alle diensten <ArrowBadge variant="text" />
              </Link>
            </Reveal>
          </div>
          <RevealGroup as="ul" className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((item) => (
              <RevealItem as="li" key={item.slug}>
                <Link href={`/diensten/${item.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-navy">
                    <Photo image={item.image} sizes="(min-width: 768px) 30vw, 92vw" className="transition-transform duration-[1.2s] ease-[var(--ease-arch)] group-hover:scale-105" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[1.25rem] font-medium tracking-[-0.025em] text-navy">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{item.tagline}</p>
                    </div>
                    <ArrowBadge variant="text" />
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </article>
  );
}
