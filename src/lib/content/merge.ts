import { defaultContent } from './defaults';
import type { SectionKey, ServicesContent, SiteContent } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Overlay stored (possibly older or partial) content onto a default value.
 * Only values with the same shape as the default are accepted, so a schema change
 * or a malformed row can never break a page.
 */
export function mergeWithDefault<T>(fallback: T, stored: unknown): T {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(stored)) return fallback;
    const template = fallback[0];
    if (template === undefined) return stored as T;
    return stored
      .map((item) => mergeWithDefault(template, item))
      .filter((item) => item !== undefined) as T;
  }
  if (isRecord(fallback)) {
    if (!isRecord(stored)) return fallback;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(fallback)) {
      result[key] = mergeWithDefault((fallback as Record<string, unknown>)[key], stored[key]);
    }
    // Optional keys that exist only in stored data (e.g. image focus points).
    for (const key of Object.keys(stored)) {
      if (!(key in result) && typeof stored[key] === 'string') result[key] = stored[key];
    }
    return result as T;
  }
  if (typeof fallback === typeof stored) return stored as T;
  return fallback;
}

/** Services keep their fixed slugs (and therefore URLs); only their content is editable. */
function mergeServices(stored: unknown): ServicesContent {
  const base = mergeWithDefault({ ...defaultContent.services, items: [] }, stored);
  const storedItems = isRecord(stored) && Array.isArray(stored.items) ? stored.items : [];
  const items = defaultContent.services.items.map((fallback) => {
    const match = storedItems.find((item) => isRecord(item) && item.slug === fallback.slug);
    return { ...mergeWithDefault(fallback, match), slug: fallback.slug };
  });
  return { ...base, items };
}

export function mergeSection<K extends SectionKey>(key: K, stored: unknown): SiteContent[K] {
  if (key === 'services') return mergeServices(stored) as SiteContent[K];
  return mergeWithDefault(defaultContent[key], stored);
}

export function mergeSite(rows: Partial<Record<SectionKey, unknown>>): SiteContent {
  return {
    settings: mergeSection('settings', rows.settings),
    home: mergeSection('home', rows.home),
    services: mergeSection('services', rows.services),
    about: mergeSection('about', rows.about),
    faq: mergeSection('faq', rows.faq),
    contact: mergeSection('contact', rows.contact),
  };
}
