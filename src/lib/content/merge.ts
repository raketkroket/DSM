import { defaultContent } from './defaults';
import type { SectionKey, ServiceContent, ServicesContent, SiteContent } from './types';

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

/** URL-safe slug from a title: lowercase, no accents, words joined by hyphens. */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/**
 * Services are an editable list: the owner can add, remove and reorder them. Known slugs keep
 * their default copy as a fallback; new services start from an empty template. Every service
 * ends up with a unique, URL-safe slug.
 */
function mergeServices(stored: unknown): ServicesContent {
  const base = mergeWithDefault({ ...defaultContent.services, items: [] }, stored);
  if (!isRecord(stored) || !Array.isArray(stored.items)) return { ...base, items: defaultContent.services.items };

  const template = blankService();
  const used = new Set<string>();
  const items = stored.items.filter(isRecord).map((item) => {
    const requested = typeof item.slug === 'string' ? slugify(item.slug) : '';
    const known = defaultContent.services.items.find((fallback) => fallback.slug === requested);
    const merged = mergeWithDefault(known ?? template, item);
    if (!known) {
      // Lists the owner has not filled in yet start empty rather than with a blank placeholder.
      for (const [key, value] of Object.entries(merged)) {
        if (Array.isArray(value) && !Array.isArray(item[key])) (merged as Record<string, unknown>)[key] = [];
      }
    }
    let slug = requested || slugify(merged.title) || 'dienst';
    if (used.has(slug)) {
      let n = 2;
      while (used.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    used.add(slug);
    return { ...merged, slug };
  });
  return { ...base, items };
}

/** Shape of an empty service: strings blank, lists keep one blank element so items are type-checked. */
function blankService(): ServiceContent {
  const blank = <T,>(value: T): T => {
    if (typeof value === 'string') return '' as T;
    if (Array.isArray(value)) return (value.length ? [blank(value[0])] : []) as T;
    if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, blank(child)])) as T;
    return value;
  };
  return {
    ...blank(defaultContent.services.items[0]),
    activitiesTitle: 'Mogelijke werkzaamheden',
    audienceTitle: 'Voor wie?',
  };
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
