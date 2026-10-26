import type { SectionKey, ServiceContent } from '@/lib/content/types';

type ServiceLink = Pick<ServiceContent, 'slug' | 'title'>;

/** Internal pages offered when choosing where a button links to. */
export function internalPages(services: ServiceLink[]) {
  return [
    { href: '/', label: 'Home' },
    { href: '/diensten', label: 'Diensten' },
    ...services.map((item) => ({ href: `/diensten/${item.slug}`, label: `Dienst: ${item.title}` })),
    { href: '/beveiligingsplanner', label: 'Beveiligingsplanner' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
    { href: '/offerte', label: 'Offerte aanvragen' },
  ];
}

const preview = (path: string, label: string) => ({ href: `/admin/voorbeeld${path === '/' ? '' : path}`, label });

/** Draft preview pages that show each section. */
export function sectionPreviews(section: SectionKey, services: ServiceLink[]) {
  const map: Record<SectionKey, { href: string; label: string }[]> = {
    home: [preview('/', 'Homepagina')],
    services: [preview('/diensten', 'Diensten (overzicht)'), ...services.map((item) => preview(`/diensten/${item.slug}`, item.title))],
    about: [preview('/over-ons', 'Over ons')],
    faq: [preview('/', 'Homepagina'), preview('/contact', 'Contact')],
    contact: [preview('/contact', 'Contact'), preview('/offerte', 'Offerte aanvragen')],
    settings: [preview('/', 'Homepagina'), preview('/contact', 'Contact')],
  };
  return map[section];
}
