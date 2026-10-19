import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { ArrowBadge } from './Button';
import { CurrentYear } from './CurrentYear';
import type { ServiceContent, SettingsContent } from '@/lib/content/types';

export function Footer({ settings, services }: { settings: SettingsContent; services: ServiceContent[] }) {
  const socials = [
    { label: 'LinkedIn', href: settings.linkedin },
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
  ].filter((social) => social.href);

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="shell relative pt-20 pb-10 md:pt-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-steel-soft!">{settings.companyName}</p>
            <p className="display-lg mt-6 max-w-[14ch] text-white">
              Uw veiligheid, <span className="accent text-steel-soft">onze verantwoordelijkheid.</span>
            </p>
            <Link
              href="/offerte"
              className="group mt-10 inline-flex items-center gap-4 border-b border-white/25 pb-3 text-lg transition-colors hover:border-white"
            >
              Vraag vrijblijvend een offerte aan
              <ArrowBadge variant="ghost-light" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <p className="mono-label text-white/45">Diensten</p>
              <ul className="mt-5 space-y-2.5 text-[0.95rem]">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/diensten/${service.slug}`} className="text-white/75 transition-colors hover:text-white">
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-10">
              <div>
                <p className="mono-label text-white/45">Navigatie</p>
                <ul className="mt-5 space-y-2.5 text-[0.95rem]">
                  {[
                    ['/', 'Home'],
                    ['/diensten', 'Diensten'],
                    ['/beveiligingsplanner', 'Beveiligingsplanner'],
                    ['/over-ons', 'Over ons'],
                    ['/contact', 'Contact'],
                    ['/offerte', 'Offerte aanvragen'],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="text-white/75 transition-colors hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {(settings.email || settings.phone || settings.address) && (
                <address className="not-italic">
                  <p className="mono-label text-white/45">Contact</p>
                  <div className="mt-5 space-y-2 text-[0.95rem] text-white/75">
                    {settings.phone && (
                      <a className="block hover:text-white" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                        {settings.phone}
                      </a>
                    )}
                    {settings.email && (
                      <a className="block hover:text-white" href={`mailto:${settings.email}`}>
                        {settings.email}
                      </a>
                    )}
                    {settings.address && <p>{settings.address}</p>}
                    {settings.postalCity && <p>{settings.postalCity}</p>}
                  </div>
                </address>
              )}
              {socials.length > 0 && (
                <ul className="flex flex-wrap gap-4 text-sm">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <a href={social.href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <Logo tone="light" />
          <p className="max-w-md text-sm text-white/50">{settings.footerText}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/45">
            <span>© <CurrentYear /> {settings.companyName}</span>
            {settings.kvk && <span>KvK {settings.kvk}</span>}
            <Link href="/privacy" className="hover:text-white">
              Privacyverklaring
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
