import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceView } from '@/components/service/ServiceView';
import { getPublishedSite } from '@/lib/content/get';

/** Prerenders every published service; services added later render on first visit and are cached. */
export async function generateStaticParams() {
  const { services } = await getPublishedSite();
  return services.items.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/diensten/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublishedSite();
  const service = site.services.items.find((item) => item.slug === slug);
  if (!service) return {};
  const path = `/diensten/${service.slug}`;
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      title: `${service.seoTitle} | ${site.settings.companyName}`,
      description: service.seoDescription,
      url: path,
      ...(service.image.src ? { images: [{ url: service.image.src, alt: service.image.alt }] } : {}),
    },
  };
}

export default async function ServicePage({ params }: PageProps<'/diensten/[slug]'>) {
  const { slug } = await params;
  const site = await getPublishedSite();
  const index = site.services.items.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  return <ServiceView service={site.services.items[index]} index={index} site={site} />;
}
