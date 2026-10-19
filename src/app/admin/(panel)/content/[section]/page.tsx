import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SectionEditorPage } from '@/components/admin/SectionEditorPage';
import { AdminSkeleton } from '@/components/admin/ui';
import { SECTION_META } from '@/lib/admin/editor-spec';
import { SECTION_KEYS, type SectionKey } from '@/lib/content/types';

export async function generateMetadata({ params }: PageProps<'/admin/content/[section]'>): Promise<Metadata> {
  const { section } = await params;
  return { title: SECTION_META[section as SectionKey]?.label ?? 'Content' };
}

async function Editor({ params }: { params: PageProps<'/admin/content/[section]'>['params'] }) {
  const { section } = await params;
  if (!(SECTION_KEYS as string[]).includes(section) || section === 'settings') notFound();
  return <SectionEditorPage section={section as SectionKey} />;
}

export default function SectionPage({ params }: PageProps<'/admin/content/[section]'>) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}
