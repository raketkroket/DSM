import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { mergeSite } from './merge';
import type { SectionKey, SiteContent } from './types';

export const CONTENT_TAG = 'site-content';

/** Published website content, cached until an admin publishes a change. */
export async function getPublishedSite(): Promise<SiteContent> {
  'use cache';
  cacheTag(CONTENT_TAG);

  const supabase = createPublicClient();
  if (!supabase) {
    cacheLife('max');
    return mergeSite({});
  }

  const { data, error } = await supabase.from('content_published').select('key, data');
  if (error) {
    // Serve defaults briefly and retry soon, rather than caching a failure.
    console.error('Kon gepubliceerde content niet laden:', error.message);
    cacheLife('minutes');
    return mergeSite({});
  }
  cacheLife('max');
  const rows: Partial<Record<SectionKey, unknown>> = {};
  for (const row of data ?? []) rows[row.key as SectionKey] = row.data;
  return mergeSite(rows);
}
