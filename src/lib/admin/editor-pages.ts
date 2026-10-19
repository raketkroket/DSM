import { defaultServices } from '@/lib/content/services';
import type { SectionKey } from '@/lib/content/types';

/** Internal pages offered when choosing where a button links to. */
export const INTERNAL_PAGES = [
  { href: '/', label: 'Home' },
  { href: '/diensten', label: 'Diensten' },
  ...defaultServices.items.map((item) => ({ href: `/diensten/${item.slug}`, label: `Dienst: ${item.title}` })),
  { href: '/over-ons', label: 'Over ons' },
  { href: '/contact', label: 'Contact' },
  { href: '/offerte', label: 'Offerte aanvragen' },
];

const preview = (path: string, label: string) => ({ href: `/admin/voorbeeld${path === '/' ? '' : path}`, label });

/** Draft preview pages that show each section. */
export const SECTION_PREVIEWS: Record<SectionKey, { href: string; label: string }[]> = {
  home: [preview('/', 'Homepagina')],
  services: [preview('/diensten', 'Diensten (overzicht)'), ...defaultServices.items.map((item) => preview(`/diensten/${item.slug}`, item.title))],
  about: [preview('/over-ons', 'Over ons')],
  faq: [preview('/', 'Homepagina'), preview('/contact', 'Contact')],
  contact: [preview('/contact', 'Contact'), preview('/offerte', 'Offerte aanvragen')],
  settings: [preview('/', 'Homepagina'), preview('/contact', 'Contact')],
};
