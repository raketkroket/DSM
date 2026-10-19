import 'server-only';
import { mergeSection, mergeSite } from '@/lib/content/merge';
import { SECTION_KEYS, type SectionKey, type SiteContent } from '@/lib/content/types';
import type { AdminContext } from './auth';

export type SectionState<K extends SectionKey = SectionKey> = {
  key: K;
  draft: SiteContent[K];
  published: SiteContent[K];
  hasDraftRow: boolean;
  hasPublishedRow: boolean;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
  /** Draft differs from what visitors currently see. */
  pending: boolean;
};

export type SectionStates = { [K in SectionKey]: SectionState<K> };

export async function getSectionStates(supabase: AdminContext['supabase']): Promise<SectionStates> {
  const [{ data: drafts, error: draftError }, { data: published, error: publishedError }] = await Promise.all([
    supabase.from('content_drafts').select('key, data, updated_at'),
    supabase.from('content_published').select('key, data, published_at'),
  ]);
  if (draftError) throw new Error(draftError.message);
  if (publishedError) throw new Error(publishedError.message);

  const states = {} as Record<SectionKey, SectionState>;
  for (const key of SECTION_KEYS) {
    const draftRow = drafts?.find((row) => row.key === key);
    const publishedRow = published?.find((row) => row.key === key);
    const publishedContent = mergeSection(key, publishedRow?.data);
    const draftContent = draftRow ? mergeSection(key, draftRow.data) : publishedContent;
    states[key] = {
      key,
      draft: draftContent,
      published: publishedContent,
      hasDraftRow: Boolean(draftRow),
      hasPublishedRow: Boolean(publishedRow),
      draftUpdatedAt: draftRow?.updated_at ?? null,
      publishedAt: publishedRow?.published_at ?? null,
      pending: Boolean(draftRow) && JSON.stringify(draftContent) !== JSON.stringify(publishedContent),
    };
  }
  return states as SectionStates;
}

/** The whole site as it would look after publishing every draft. */
export async function getDraftSite(supabase: AdminContext['supabase']): Promise<SiteContent> {
  const states = await getSectionStates(supabase);
  const rows: Partial<Record<SectionKey, unknown>> = {};
  for (const key of SECTION_KEYS) rows[key] = states[key].draft;
  return mergeSite(rows);
}

/** Lists every place an image URL is used, across drafts and published content. */
export function findImageUsage(states: SectionStates, url: string) {
  const places = new Set<string>();
  const walk = (value: unknown, section: SectionKey, trail: string[]) => {
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, section, [...trail, String(index + 1)]));
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (record.src === url) places.add(`${section}${trail.length ? ` › ${trail.join(' › ')}` : ''}`);
      for (const [key, child] of Object.entries(record)) if (key !== 'src') walk(child, section, [...trail, key]);
    }
  };
  for (const key of SECTION_KEYS) {
    walk(states[key].draft, key, []);
    walk(states[key].published, key, []);
  }
  return [...places];
}
