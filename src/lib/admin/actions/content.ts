'use server';

import { updateTag } from 'next/cache';
import { CONTENT_TAG } from '@/lib/content/get';
import { sanitizeSection } from '@/lib/content/sanitize';
import { SECTION_KEYS, type SectionKey } from '@/lib/content/types';
import { getAdmin } from '../auth';
import { getSectionStates } from '../content';
import type { ActionResult } from './types';

const MAX_BYTES = 400_000;

function isSection(value: unknown): value is SectionKey {
  return typeof value === 'string' && (SECTION_KEYS as string[]).includes(value);
}

const expired: ActionResult = { ok: false, message: 'Uw sessie is verlopen. Log opnieuw in.' };

export async function saveDraft(section: SectionKey, input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  if (JSON.stringify(input ?? null).length > MAX_BYTES) return { ok: false, message: 'De inhoud is te groot om op te slaan.' };

  const { data, problems } = sanitizeSection(section, input);
  const at = new Date().toISOString();
  const { error } = await admin.supabase
    .from('content_drafts')
    .upsert({ key: section, data, updated_at: at, updated_by: admin.user.id }, { onConflict: 'key' });
  if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  return { ok: true, message: problems.length ? 'Opgeslagen, met correcties.' : 'Concept opgeslagen.', at, problems };
}

export async function publishSection(section: SectionKey, input?: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };

  let problems: string[] = [];
  if (input !== undefined) {
    const saved = await saveDraft(section, input);
    if (!saved.ok) return saved;
    problems = saved.problems ?? [];
  }

  const { data: draft, error: readError } = await admin.supabase.from('content_drafts').select('data').eq('key', section).maybeSingle();
  if (readError) return { ok: false, message: `Publiceren mislukt: ${readError.message}` };
  if (!draft) return { ok: false, message: 'Er is geen concept om te publiceren.' };

  const { data } = sanitizeSection(section, draft.data);
  const at = new Date().toISOString();
  const { error } = await admin.supabase
    .from('content_published')
    .upsert({ key: section, data, published_at: at, published_by: admin.user.id }, { onConflict: 'key' });
  if (error) return { ok: false, message: `Publiceren mislukt: ${error.message}` };

  updateTag(CONTENT_TAG);
  return { ok: true, message: 'Gepubliceerd. De wijzigingen staan live.', at, problems };
}

export async function publishAll(): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  const { data: drafts, error } = await admin.supabase.from('content_drafts').select('key, data');
  if (error) return { ok: false, message: `Publiceren mislukt: ${error.message}` };
  if (!drafts?.length) return { ok: false, message: 'Er zijn geen concepten om te publiceren.' };

  const at = new Date().toISOString();
  const rows = drafts
    .filter((row) => isSection(row.key))
    .map((row) => ({ key: row.key, data: sanitizeSection(row.key as SectionKey, row.data).data, published_at: at, published_by: admin.user.id }));
  const { error: upsertError } = await admin.supabase.from('content_published').upsert(rows, { onConflict: 'key' });
  if (upsertError) return { ok: false, message: `Publiceren mislukt: ${upsertError.message}` };
  updateTag(CONTENT_TAG);
  return { ok: true, message: `${rows.length} onderdelen gepubliceerd.`, at };
}

export async function discardDraft(section: SectionKey): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  const { error } = await admin.supabase.from('content_drafts').delete().eq('key', section);
  if (error) return { ok: false, message: `Verwerpen mislukt: ${error.message}` };
  return { ok: true, message: 'Concept verworpen. De gepubliceerde versie is hersteld.' };
}

/**
 * Puts a photo into one image slot of a section's concept (used by "Foto's vervangen").
 * The path is validated by re-shaping the whole section afterwards.
 */
export async function setSlotImage(section: SectionKey, path: (string | number)[], image: { src: string; alt: string }): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  if (!Array.isArray(path) || path.length === 0 || path.length > 8 || !path.every((part) => typeof part === 'number' || /^[a-zA-Z]+$/.test(String(part)))) {
    return { ok: false, message: 'Ongeldige plek.' };
  }
  const states = await getSectionStates(admin.supabase);
  const draft = structuredClone(states[section].draft) as unknown as Record<string | number, unknown>;

  let node: Record<string | number, unknown> = draft;
  for (const part of path.slice(0, -1)) {
    const next = node[part];
    if (!next || typeof next !== 'object') return { ok: false, message: 'Deze plek bestaat niet meer. Vernieuw de pagina.' };
    node = next as Record<string | number, unknown>;
  }
  const last = path[path.length - 1];
  const current = node[last] as { src?: unknown } | undefined;
  if (!current || typeof current !== 'object' || typeof current.src !== 'string') return { ok: false, message: 'Op deze plek staat geen foto.' };
  node[last] = { src: image.src, alt: image.alt.slice(0, 300) };

  return saveDraft(section, draft);
}
