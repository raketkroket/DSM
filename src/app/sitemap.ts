import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { SERVICE_SLUGS } from '@/lib/content/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/diensten', priority: 0.9 },
    ...SERVICE_SLUGS.map((slug) => ({ path: `/diensten/${slug}`, priority: 0.8 })),
    { path: '/beveiligingsplanner', priority: 0.8 },
    { path: '/over-ons', priority: 0.7 },
    { path: '/contact', priority: 0.7 },
    { path: '/offerte', priority: 0.8 },
    { path: '/privacy', priority: 0.2 },
  ];
  return pages.map(({ path, priority }) => ({
    url: `${env.siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority,
  }));
}
