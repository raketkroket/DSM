import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { readLive, unwrapSection } from './files';
import { mergeSite } from './merge';
import { SECTION_KEYS, type SectionKey, type SiteContent } from './types';

export const CONTENT_TAG = 'site-content';

/**
 * Published website content: the JSON files in content/live/ of this deployment.
 * Publishing commits new files and Vercel rebuilds the site; locally the tag refreshes it at once.
 */
export async function getPublishedSite(): Promise<SiteContent> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('max');
  const rows: Partial<Record<SectionKey, unknown>> = {};
  await Promise.all(
    SECTION_KEYS.map(async (key) => {
      rows[key] = unwrapSection(await readLive(key)).content;
    }),
  );
  return mergeSite(rows);
}
