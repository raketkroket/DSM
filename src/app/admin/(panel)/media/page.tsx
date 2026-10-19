import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { AdminSkeleton, PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/auth';
import type { MediaItem } from '@/lib/admin/actions/media';

export const metadata: Metadata = { title: 'Mediabibliotheek' };

async function Library() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('media').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) return <p className="text-danger">Mediabibliotheek laden mislukt: {error.message}</p>;
  return <MediaLibrary initial={(data ?? []) as MediaItem[]} />;
}

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Website"
        title="Mediabibliotheek"
        description="Upload, vervang en beheer foto’s. Kies foto’s voor een pagina via Content; daar bepaalt u ook het focuspunt."
      />
      <Suspense fallback={<AdminSkeleton />}>
        <Library />
      </Suspense>
    </div>
  );
}
