import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ContentEditor } from '@/components/admin/editor/ContentEditor';
import { PageHeader } from '@/components/admin/ui';
import { requireEditor } from '@/lib/admin/auth';
import { getSectionStates } from '@/lib/admin/content';
import { internalPages, sectionPreviews } from '@/lib/admin/editor-pages';
import { EDITOR_SPEC, SECTION_META } from '@/lib/admin/editor-spec';
import { readLibrary } from '@/lib/admin/media';
import type { SectionKey } from '@/lib/content/types';

/** Server part of an editor screen: loads the section and the media library. */
export async function SectionEditorPage({ section, back = true }: { section: SectionKey; back?: boolean }) {
  const { storage } = await requireEditor();
  const [states, library] = await Promise.all([getSectionStates(storage), readLibrary(storage)]);
  const state = states[section];
  return (
    <div className="space-y-6">
      {back && (
        <Link href="/admin/content" className="inline-flex items-center gap-2 text-[0.88rem] text-muted hover:text-navy">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Alle onderdelen
        </Link>
      )}
      <PageHeader eyebrow="Content" title={SECTION_META[section].label} description={SECTION_META[section].description} />
      <ContentEditor
        section={section}
        panels={EDITOR_SPEC[section]}
        initial={state.draft}
        published={state.published}
        pending={state.pending}
        publishedAt={state.publishedAt}
        draftUpdatedAt={state.draftUpdatedAt}
        media={library.items}
        previews={sectionPreviews(section, states.services.draft.items)}
        internalPages={internalPages(states.services.draft.items)}
      />
    </div>
  );
}
