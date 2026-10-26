import 'server-only';
import { draftPath, livePath, parseJson, unwrapSection } from '@/lib/content/files';
import { mergeSection, mergeSite } from '@/lib/content/merge';
import { SECTION_KEYS, type SectionKey, type SiteContent } from '@/lib/content/types';
import type { Storage } from '@/lib/server/storage';

export type SectionState<K extends SectionKey = SectionKey> = {
  key: K;
  draft: SiteContent[K];
  published: SiteContent[K];
  /** Blob shas of the stored files (null: not saved yet), used to detect conflicting saves. */
  draftSha: string | null;
  publishedSha: string | null;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
  hasPublishedRow: boolean;
  /** Draft differs from what visitors currently see. */
  pending: boolean;
};

export type SectionStates = { [K in SectionKey]: SectionState<K> };

export async function getSectionStates(storage: Storage): Promise<SectionStates> {
  const files = await storage.read(SECTION_KEYS.flatMap((key) => [livePath(key), draftPath(key)]));
  const states = {} as Record<SectionKey, SectionState>;
  for (const key of SECTION_KEYS) {
    const live = files[livePath(key)];
    const draft = files[draftPath(key)];
    const liveFile = unwrapSection(parseJson(live?.text));
    const draftFile = unwrapSection(parseJson(draft?.text));
    const published = mergeSection(key, liveFile.content);
    const draftContent = draft ? mergeSection(key, draftFile.content) : published;
    states[key] = {
      key,
      draft: draftContent,
      published,
      draftSha: draft?.sha ?? null,
      publishedSha: live?.sha ?? null,
      draftUpdatedAt: draft ? draftFile.updatedAt : null,
      publishedAt: liveFile.updatedAt,
      hasPublishedRow: Boolean(live),
      pending: Boolean(draft) && JSON.stringify(draftContent) !== JSON.stringify(published),
    };
  }
  return states as SectionStates;
}

/** The whole site as it would look after publishing every draft. */
export async function getDraftSite(storage: Storage): Promise<SiteContent> {
  const states = await getSectionStates(storage);
  const rows: Partial<Record<SectionKey, unknown>> = {};
  for (const key of SECTION_KEYS) rows[key] = states[key].draft;
  return mergeSite(rows);
}

/** Lists every place an image URL is used, across drafts and published content. */
export function findImageUsage(states: SectionStates, url: string, which: 'all' | 'published' = 'all') {
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
    if (which === 'all') walk(states[key].draft, key, []);
    walk(states[key].published, key, []);
  }
  return [...places];
}
