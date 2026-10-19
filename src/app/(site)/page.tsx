import { HomeView } from '@/components/home/HomeView';
import { getPublishedSite } from '@/lib/content/get';

export default async function HomePage() {
  const site = await getPublishedSite();
  return <HomeView site={site} />;
}
