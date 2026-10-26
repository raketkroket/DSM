import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { PublishAllButton } from '@/components/admin/PublishAllButton';
import { AdminSkeleton, Badge, PageHeader, formatDate } from '@/components/admin/ui';
import { requireEditor } from '@/lib/admin/auth';
import { getSectionStates } from '@/lib/admin/content';
import { SECTION_META } from '@/lib/admin/editor-spec';
import { SECTION_KEYS } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Content' };

async function Overview() {
  const { storage } = await requireEditor();
  const states = await getSectionStates(storage);
  const pending = SECTION_KEYS.filter((key) => states[key].pending).length;
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Website"
        title="Content"
        description="Wijzig teksten en foto’s. Wijzigingen worden eerst als concept bewaard; met Publiceren zet u ze live."
        actions={pending > 0 ? <PublishAllButton count={pending} /> : undefined}
      />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTION_KEYS.map((key) => {
          const state = states[key];
          return (
            <li key={key}>
              <Link
                href={key === 'settings' ? '/admin/instellingen' : `/admin/content/${key}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-navy"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[1.15rem] font-medium tracking-[-0.02em] text-navy">{SECTION_META[key].label}</h2>
                  {state.pending ? <Badge tone="warning">Concept</Badge> : state.hasPublishedRow ? <Badge tone="success">Gepubliceerd</Badge> : <Badge>Standaard</Badge>}
                </div>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{SECTION_META[key].description}</p>
                <div className="mt-auto flex items-center justify-between pt-6 text-[0.8rem] text-muted">
                  <span>{state.publishedAt ? `Gepubliceerd ${formatDate(state.publishedAt)}` : 'Nog niet aangepast'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}
