import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PhotoSlotCard } from '@/components/admin/PhotoSlotCard';
import { PublishAllButton } from '@/components/admin/PublishAllButton';
import { AdminSkeleton, Badge, PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/auth';
import { getSectionStates } from '@/lib/admin/content';
import { photoSlots } from '@/lib/admin/photo-slots';
import type { MediaItem } from '@/lib/admin/actions/media';
import { SECTION_KEYS, type SectionKey, type SiteContent } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Foto’s vervangen' };

async function Slots({ searchParams }: { searchParams: PageProps<'/admin/fotos'>['searchParams'] }) {
  const params = await searchParams;
  const showAll = params.alle === '1';
  const { supabase } = await requireAdmin();
  const [states, { data: media }] = await Promise.all([
    getSectionStates(supabase),
    supabase.from('media').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
  ]);
  const drafts = Object.fromEntries(SECTION_KEYS.map((key) => [key, states[key].draft])) as Pick<SiteContent, SectionKey>;
  const slots = photoSlots(drafts).filter((slot) => slot.image.src);
  const temporary = slots.filter((slot) => slot.temporary);
  const visible = showAll ? slots : temporary;
  const pending = SECTION_KEYS.filter((key) => states[key].pending).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Website"
        title="Foto’s vervangen"
        description="De website gebruikt tijdelijke stockfoto’s. Upload per plek een eigen foto; hij wordt automatisch geoptimaliseerd en als concept geplaatst. Publiceer daarna om de foto’s live te zetten."
        actions={pending > 0 ? <PublishAllButton count={pending} /> : undefined}
      />
      <div className="flex flex-wrap items-center gap-3 text-[0.9rem]">
        <Badge tone={temporary.length ? 'warning' : 'success'}>
          {temporary.length ? `${temporary.length} van ${slots.length} plekken met een tijdelijke foto` : 'Alle foto’s zijn eigen foto’s'}
        </Badge>
        <a href={showAll ? '/admin/fotos' : '/admin/fotos?alle=1'} className="text-steel underline-offset-4 hover:text-navy hover:underline">
          {showAll ? 'Alleen tijdelijke foto’s tonen' : 'Alle fotoplekken tonen'}
        </a>
      </div>
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-muted">Er staan geen tijdelijke foto’s meer op de website.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((slot) => (
            <PhotoSlotCard
              key={`${slot.section}-${slot.path.join('.')}`}
              section={slot.section}
              path={slot.path}
              label={slot.label}
              src={slot.image.src}
              alt={slot.image.alt}
              temporary={slot.temporary}
              media={(media ?? []) as MediaItem[]}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PhotosPage({ searchParams }: PageProps<'/admin/fotos'>) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Slots searchParams={searchParams} />
    </Suspense>
  );
}
