import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Reveal } from '@/components/motion/Reveal';
import { ArrowBadge } from '@/components/site/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { Faq } from '@/components/site/Faq';
import { Photo } from '@/components/site/Photo';
import type { SiteContent } from '@/lib/content/types';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

export function ContactView({ site }: { site: SiteContent }) {
  const { contact, settings, faq } = site;
  const hasDetails = settings.email || settings.phone || settings.address;
  return (
    <>
      <section className="pt-[5.5rem] md:pt-24">
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-end pt-10 pb-4 lg:col-span-7 lg:pt-24">
              <div className="intro-fade" style={delay(150)}>
                <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
              </div>
              <p className="intro-fade eyebrow mt-10" style={delay(220)}>
                {contact.hero.eyebrow}
              </p>
              <h1 className="mt-6 display-xl text-navy">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="intro-rise block" style={delay(300)}>
                    {contact.hero.title}
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.1em]">
                  <span className="intro-rise accent block text-navy-soft" style={delay(420)}>
                    {contact.hero.titleAccent}
                  </span>
                </span>
              </h1>
              <p className="intro-fade-up lead mt-8 max-w-[36rem] text-muted" style={delay(650)}>
                {contact.hero.lead}
              </p>
            </div>
            <div
              className="intro-unveil-up relative h-[22rem] overflow-hidden rounded-[1.75rem] bg-navy lg:col-span-5 lg:h-auto lg:min-h-[36rem]"
              style={delay(200)}
            >
              <div className="intro-settle absolute inset-0" style={delay(200)}>
                <Photo image={contact.hero.image} sizes="(min-width: 1024px) 40vw, 92vw" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="contactformulier" className="py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-6">
          <aside className="space-y-6 lg:col-span-4">
            <Reveal className="relative overflow-hidden rounded-[1.5rem] bg-navy p-8 text-white">
              <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-steel-soft!">Offerte</p>
                <h2 className="mt-5 text-[1.6rem] leading-tight font-medium tracking-[-0.03em]">{contact.quoteTitle}</h2>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-white/70">{contact.quoteIntro}</p>
                <Link href="/offerte" className="group mt-7 inline-flex items-center gap-3 border-b border-white/30 pb-2 text-[0.98rem] hover:border-white">
                  Start de aanvraag <ArrowBadge variant="ghost-light" />
                </Link>
              </div>
            </Reveal>
            {hasDetails ? (
              <Reveal delay={0.1} className="rounded-[1.5rem] border border-line bg-white p-8">
                <p className="eyebrow">Direct contact</p>
                <ul className="mt-6 space-y-4 text-[0.98rem]">
                  {settings.phone && (
                    <li>
                      <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-navy hover:underline">
                        <Phone className="h-4 w-4 text-steel" aria-hidden /> {settings.phone}
                      </a>
                    </li>
                  )}
                  {settings.email && (
                    <li>
                      <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-navy hover:underline">
                        <Mail className="h-4 w-4 text-steel" aria-hidden /> {settings.email}
                      </a>
                    </li>
                  )}
                  {(settings.address || settings.postalCity) && (
                    <li className="flex items-start gap-3 text-ink">
                      <MapPin className="mt-1 h-4 w-4 text-steel" aria-hidden />
                      <span>
                        {settings.address}
                        {settings.address && settings.postalCity && <br />}
                        {settings.postalCity}
                      </span>
                    </li>
                  )}
                </ul>
              </Reveal>
            ) : null}
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <h2 id="contactformulier" className="display-md text-navy">
                {contact.formTitle}
              </h2>
              <p className="mt-4 max-w-[36rem] text-[1.05rem] leading-relaxed text-muted">{contact.formIntro}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <ContactForm privacyNote={contact.privacyNote} />
            </Reveal>
          </div>
        </div>
      </section>

      <div className="border-t border-line bg-white">
        <Faq faq={faq} />
      </div>
    </>
  );
}
