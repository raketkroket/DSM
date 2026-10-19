'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { EASE } from '@/components/motion/ease';
import { Photo } from './Photo';
import { ArrowBadge, buttonClass } from './Button';
import type { ImageRef } from '@/lib/content/types';

export type NavService = { slug: string; title: string; summary: string; image: ImageRef };

type HeaderProps = {
  services: NavService[];
  logo: ImageRef;
  email: string;
  phone: string;
};

const links = [
  { href: '/', label: 'Home' },
  { href: '/diensten', label: 'Diensten', mega: true },
  { href: '/over-ons', label: 'Over ons' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ services, logo, email, phone }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preview, setPreview] = useState(0);
  const lastY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaId = useId();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
    const goingDown = y > lastY.current;
    setHidden(goingDown && y > 420 && !megaOpen && !mobileOpen);
    lastY.current = y;
  });

  // Close menus whenever the route changes.
  const [routeSeen, setRouteSeen] = useState(pathname);
  if (routeSeen !== pathname) {
    setRouteSeen(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a
        href="#inhoud"
        className="fixed top-3 left-3 z-[80] -translate-y-24 rounded-full bg-navy px-5 py-3 text-sm text-white focus:translate-y-0"
      >
        Direct naar inhoud
      </a>

      <header
        className={`intro-nav fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-[var(--ease-arch)] ${
          hidden ? '-translate-y-[120%]' : 'translate-y-0'
        }`}
        style={{ '--d': '80ms' } as React.CSSProperties}
      >
        <div className="shell pt-3 md:pt-4">
          <div
            className={`relative flex h-16 items-center justify-between rounded-full border pr-2 pl-5 transition-all duration-700 ease-[var(--ease-arch)] md:h-[4.25rem] md:pl-6 ${
              scrolled || megaOpen
                ? 'border-line/80 bg-white/90 shadow-soft backdrop-blur-xl'
                : 'border-white/60 bg-white/75 backdrop-blur-md'
            }`}
            onMouseLeave={scheduleClose}
          >
            <Link href="/" aria-label="Dedicated Security Management — naar de homepage" className="shrink-0">
              <Logo image={logo} />
            </Link>

            <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-1 lg:flex">
              {links.map((link) =>
                link.mega ? (
                  <div key={link.href} className="relative" onMouseEnter={openMega}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        className={`relative rounded-full py-2.5 pr-1 pl-4 text-[0.92rem] transition-colors ${
                          isActive(link.href) ? 'text-navy' : 'text-ink/70 hover:text-navy'
                        }`}
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={megaOpen}
                        aria-controls={megaId}
                        aria-label="Toon alle diensten"
                        onClick={() => setMegaOpen((open) => !open)}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink/60 hover:text-navy"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${megaOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {isActive(link.href) && <ActiveDot />}
                  </div>
                ) : (
                  <div key={link.href} className="relative" onMouseEnter={scheduleClose}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={`block rounded-full px-4 py-2.5 text-[0.92rem] transition-colors ${
                        isActive(link.href) ? 'text-navy' : 'text-ink/70 hover:text-navy'
                      }`}
                    >
                      {link.label}
                    </Link>
                    {isActive(link.href) && <ActiveDot />}
                  </div>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block">
                <Link href="/offerte" className={buttonClass('primary', 'min-h-11! pr-2! text-[0.88rem] whitespace-nowrap')}>
                  <span>Offerte aanvragen</span>
                  <ArrowBadge />
                </Link>
              </span>
              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-full bg-navy text-white lg:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobiel-menu"
                aria-label={mobileOpen ? 'Menu sluiten' : 'Menu openen'}
                onClick={() => setMobileOpen((open) => !open)}
              >
                <span className="relative block h-3 w-4">
                  <span className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ${mobileOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                  <span className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ${mobileOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
                </span>
              </button>
            </div>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  id={megaId}
                  onMouseEnter={openMega}
                  initial={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0 round 28px)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 28px)' }}
                  exit={{ opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0 round 28px)' }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute top-[calc(100%+0.6rem)] right-0 left-0 hidden overflow-hidden rounded-[28px] border border-line bg-white shadow-panel lg:block"
                >
                  <div className="grid grid-cols-[1.35fr_1fr]">
                    <div className="p-8">
                      <p className="eyebrow">Onze diensten</p>
                      <ul className="mt-6 grid grid-cols-2 gap-x-6">
                        {services.map((service, index) => (
                          <li key={service.slug}>
                            <Link
                              href={`/diensten/${service.slug}`}
                              onMouseEnter={() => setPreview(index)}
                              onFocus={() => setPreview(index)}
                              className="group flex items-baseline gap-4 border-b border-line py-3.5 text-[0.98rem] text-ink transition-colors hover:text-navy"
                            >
                              <span className="font-mono text-[0.68rem] text-steel">{String(index + 1).padStart(2, '0')}</span>
                              <span className="transition-transform duration-500 ease-[var(--ease-arch)] group-hover:translate-x-1.5">{service.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href="/diensten" className="mt-7 inline-flex items-center gap-3 text-sm font-medium text-navy">
                        Bekijk alle diensten <ArrowBadge variant="text" />
                      </Link>
                    </div>
                    <div className="relative min-h-[26rem] overflow-hidden bg-navy">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={preview}
                          className="absolute inset-0"
                          initial={{ opacity: 0, scale: 1.06 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: EASE }}
                        >
                          <Photo image={services[preview].image} sizes="420px" />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                        <p className="font-mono text-[0.68rem] tracking-[0.18em] text-white/60 uppercase">
                          {String(preview + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                        </p>
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-white/85">{services[preview].summary}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobiel-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-navy-deep text-white lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
            <div className="shell relative flex min-h-full flex-col pt-28 pb-10">
              <nav aria-label="Mobiele navigatie">
                <ul>
                  {links.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.15 + index * 0.06 }}
                      className="border-b border-white/10"
                    >
                      <Link
                        href={link.href}
                        className="flex items-baseline justify-between py-4 text-[2.4rem] leading-none font-medium tracking-[-0.04em]"
                        aria-current={isActive(link.href) ? 'page' : undefined}
                      >
                        {link.label}
                        <span className="font-mono text-xs text-white/40">{String(index + 1).padStart(2, '0')}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-10"
              >
                <p className="mono-label text-white/50">Diensten</p>
                <ul className="mt-4 grid grid-cols-1 gap-x-6 xs:grid-cols-2">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/diensten/${service.slug}`} className="block py-2 text-[0.98rem] text-white/80 hover:text-white">
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
                className="mt-auto pt-10"
              >
                <Link href="/offerte" className={buttonClass('light', 'w-full pr-2.5')}>
                  <span>Vraag vrijblijvend een offerte aan</span>
                  <ArrowBadge variant="light" />
                </Link>
                {(email || phone) && (
                  <div className="mt-6 flex flex-col gap-3 text-sm text-white/70">
                    {phone && (
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3">
                        <Phone className="h-4 w-4" /> {phone}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-3">
                        <Mail className="h-4 w-4" /> {email}
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActiveDot() {
  return (
    <motion.span
      layoutId="nav-active"
      className="absolute -bottom-0.5 left-1/2 -ml-0.5 h-1 w-1 rounded-full bg-steel"
      transition={{ duration: 0.6, ease: EASE }}
    />
  );
}
