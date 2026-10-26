import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { AdminSkeleton, PageHeader } from '@/components/admin/ui';
import { requireEditor } from '@/lib/admin/auth';
import { readLibrary } from '@/lib/admin/media';

export const metadata: Metadata = { title: 'Mediabibliotheek' };

async function Library() {
  const { storage } = await requireEditor();
  const { items } = await readLibrary(storage);
  return <MediaLibrary initial={items} />;
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
