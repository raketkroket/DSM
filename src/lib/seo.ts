import { env } from './env';
import type { FaqContent, ServiceContent, SiteContent } from './content/types';

const url = (path = '') => `${env.siteUrl}${path}`;

export function organizationJsonLd({ settings, services }: SiteContent) {
  const sameAs = [settings.linkedin, settings.instagram, settings.facebook].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': url('/#organisatie'),
    name: settings.companyName,
    url: url('/'),
    slogan: settings.tagline,
    description: settings.seoDescription,
    ...(settings.logo.src ? { logo: settings.logo.src } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address || settings.postalCity
      ? { address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: settings.postalCity, addressCountry: 'NL' } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: services.items.map((service) => service.title),
  };
}

export function serviceJsonLd(service: ServiceContent, site: SiteContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url(`/diensten/${service.slug}#dienst`),
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: url(`/diensten/${service.slug}`),
    provider: { '@id': url('/#organisatie'), name: site.settings.companyName },
    ...(service.image.src ? { image: service.image.src } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}

export function faqJsonLd(faq: FaqContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
