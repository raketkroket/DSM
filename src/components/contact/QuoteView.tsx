import { Suspense } from 'react';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { Photo } from '@/components/site/Photo';
import type { AvailabilityDay } from '@/lib/availability';
import type { SiteContent } from '@/lib/content/types';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

export function QuoteView({ site, availability = [] }: { site: SiteContent; availability?: AvailabilityDay[] }) {
  const { contact, home, services, settings } = site;
  return (
    <section className="pt-[5.5rem] pb-16 md:pt-24 md:pb-24">
      <div className="shell grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Context panel */}
        <aside className="relative min-w-0 overflow-hidden rounded-[3px] bg-navy text-white lg:col-span-5">
          <div className="intro-fade absolute inset-0" style={delay(100)} aria-hidden>
            <Photo image={{ ...contact.quoteImage, alt: '' }} sizes="(min-width: 1024px) 40vw, 92vw" className="opacity-35" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/85 to-navy-deep" />
          </div>
          <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative flex h-full flex-col p-7 sm:p-10 lg:min-h-[calc(100svh-8rem)]">
            <div className="intro-fade" style={delay(200)}>
              <Breadcrumbs tone="light" items={[{ name: 'Home', href: '/' }, { name: 'Offerte aanvragen' }]} />
            </div>
            <h1 className="mt-10 text-[clamp(2.3rem,4.4vw,4.2rem)] leading-[0.98] font-medium tracking-[-0.045em]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="intro-rise block" style={delay(300)}>
                  {contact.quoteTitle}
                </span>
              </span>
            </h1>
            <p className="intro-fade-up mt-6 max-w-[30rem] text-[1.02rem] leading-relaxed text-white/75" style={delay(520)}>
              {contact.quoteIntro}
            </p>
            <ol className="intro-fade mt-auto space-y-3 pt-12 text-[0.92rem] text-white/70" style={delay(700)}>
              {home.process.steps.slice(0, 3).map((step, index) => (
                <li key={step.title} className="flex gap-4 border-t border-white/12 pt-3">
                  <span className="font-mono text-[0.68rem] text-steel-soft">{String(index + 1).padStart(2, '0')}</span>
                  {step.title}
                </li>
              ))}
            </ol>
            {(settings.phone || settings.email) && (
              <p className="mt-8 text-[0.88rem] text-white/60">
                Liever direct contact?{' '}
                {settings.phone && (
                  <a className="text-white underline underline-offset-4" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                    {settings.phone}
                  </a>
                )}
                {settings.phone && settings.email && ' · '}
                {settings.email && (
                  <a className="text-white underline underline-offset-4" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                )}
              </p>
            )}
          </div>
        </aside>

        {/* Form */}
        <div className="intro-fade-up min-w-0 rounded-[3px] border border-line bg-white p-5 shadow-soft sm:p-10 lg:col-span-7 lg:p-14" style={delay(400)}>
          <Suspense fallback={<div className="min-h-[34rem] animate-pulse rounded-[3px] bg-mist/60" aria-label="Formulier laden" />}>
            <QuoteForm
              services={services.items.map(({ slug, title, shortTitle }) => ({ slug, title, shortTitle }))}
              privacyNote={contact.privacyNote}
              confirmationTitle={contact.confirmationTitle}
              confirmationText={contact.confirmationText}
              availability={availability}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
