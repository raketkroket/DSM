import { isTemporaryPhoto } from '@/lib/content/photos';
import { SECTION_KEYS, type ImageRef, type SectionKey, type SiteContent } from '@/lib/content/types';
import { EDITOR_SPEC, SECTION_META, type FieldSpec } from './editor-spec';

export type PhotoSlot = {
  section: SectionKey;
  path: (string | number)[];
  label: string;
  image: ImageRef;
  temporary: boolean;
};

const isImage = (value: unknown): value is ImageRef =>
  Boolean(value && typeof value === 'object' && typeof (value as ImageRef).src === 'string' && typeof (value as ImageRef).alt === 'string');

/** Walks the editor schema alongside the content, so every slot gets the same label the editor shows. */
function walk(fields: FieldSpec[], data: unknown, path: (string | number)[], trail: string[], section: SectionKey, out: PhotoSlot[]) {
  const record = (data ?? {}) as Record<string, unknown>;
  for (const field of fields) {
    const value = record[field.key];
    const here = [...path, field.key];
    if (field.type === 'image' && isImage(value)) {
      out.push({ section, path: here, label: [...trail, field.label].join(' › '), image: value, temporary: isTemporaryPhoto(value.src) });
    } else if (field.type === 'group') {
      walk(field.fields, value, here, [...trail, field.label], section, out);
    } else if (field.type === 'list' && Array.isArray(value)) {
      value.forEach((item, index) => {
        const raw = field.titleKey ? (item as Record<string, unknown>)?.[field.titleKey] : undefined;
        const name = typeof raw === 'string' && raw ? raw : `${field.itemLabel} ${index + 1}`;
        if (Array.isArray(field.item)) {
          walk(field.item, item, [...here, index], [...trail, name], section, out);
        } else if (field.item.type === 'image' && isImage(item)) {
          out.push({ section, path: [...here, index], label: [...trail, name].join(' › '), image: item, temporary: isTemporaryPhoto(item.src) });
        }
      });
    }
  }
}

export function photoSlots(site: Pick<SiteContent, SectionKey>): PhotoSlot[] {
  const out: PhotoSlot[] = [];
  for (const section of SECTION_KEYS) {
    for (const panel of EDITOR_SPEC[section]) {
      const data = panel.key ? (site[section] as unknown as Record<string, unknown>)[panel.key] : site[section];
      const path = panel.key ? [panel.key] : [];
      walk(panel.fields, data, path, [SECTION_META[section].label, panel.label], section, out);
    }
  }
  return out;
}
