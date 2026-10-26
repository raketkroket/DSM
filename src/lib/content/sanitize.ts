import { mergeSection } from './merge';
import type { SectionKey, SiteContent } from './types';

const MAX_TEXT = 6000;

/** Hosts that next/image is configured for; anything else would break rendering. */
export function allowedImageHosts() {
  const hosts = ['images.unsplash.com'];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) hosts.push(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
  } catch {
    // ignore malformed env
  }
  return hosts;
}

export function isAllowedImageSrc(src: string) {
  if (src === '') return true;
  // Bundled photography (temporary stock and brand assets) served from /public/images.
  if (/^\/images\/[a-z0-9/_-]+\.(jpe?g|png|webp|avif)$/i.test(src)) return true;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && allowedImageHosts().includes(url.hostname);
  } catch {
    return false;
  }
}

/** Internal paths, https links, mailto: and tel: only. */
export function isSafeHref(href: string) {
  if (href === '') return true;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  return /^(https:\/\/|mailto:|tel:)/i.test(href);
}

const FOCUS = /^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/;

function clean(value: unknown, key: string, problems: string[], path: string): unknown {
  if (typeof value === 'string') {
    const trimmed = value.replace(/\u0000/g, '').slice(0, MAX_TEXT);
    if (key === 'src' && !isAllowedImageSrc(trimmed)) {
      problems.push(`${path}: afbeelding moet uit de mediabibliotheek komen`);
      return '';
    }
    if (key === 'href' && !isSafeHref(trimmed)) {
      problems.push(`${path}: ongeldige link`);
      return '/';
    }
    if (key === 'focus' && trimmed !== '' && !FOCUS.test(trimmed)) return '';
    if (key.endsWith('Color') && trimmed !== '' && !/^#[0-9a-f]{6}$/i.test(trimmed)) {
      problems.push(`${path}: gebruik een kleurcode zoals #14243A`);
      return '';
    }
    if (['email', 'notificationEmail'].includes(key) && trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      problems.push(`${path}: ongeldig e-mailadres`);
      return '';
    }
    if (['linkedin', 'instagram', 'facebook'].includes(key) && trimmed && !/^https:\/\//i.test(trimmed)) {
      problems.push(`${path}: gebruik een volledige https-link`);
      return '';
    }
    return trimmed;
  }
  if (Array.isArray(value)) return value.slice(0, 60).map((item, index) => clean(item, key, problems, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [childKey, child] of Object.entries(value)) result[childKey] = clean(child, childKey, problems, path ? `${path}.${childKey}` : childKey);
    return result;
  }
  return value;
}

/** Coerces untrusted editor input into the section's exact shape with safe values. */
export function sanitizeSection<K extends SectionKey>(key: K, input: unknown): { data: SiteContent[K]; problems: string[] } {
  const problems: string[] = [];
  const shaped = mergeSection(key, input);
  const data = clean(shaped, '', problems, '') as SiteContent[K];
  return { data, problems };
}
