'use server';

import { updateTag } from 'next/cache';
import { draftPath, livePath, wrapSection } from '@/lib/content/files';
import { CONTENT_TAG } from '@/lib/content/get';
import { sanitizeSection } from '@/lib/content/sanitize';
import { SECTION_KEYS, type SectionKey } from '@/lib/content/types';
import { serialize, type Storage } from '@/lib/server/storage';
import { getAdmin } from '../auth';
import { getSectionStates } from '../content';
import { liveMessage, storageFailure, expired, notConnected } from './shared';
import type { ActionResult } from './types';

const MAX_BYTES = 400_000;

function isSection(value: unknown): value is SectionKey {
  return typeof value === 'string' && (SECTION_KEYS as string[]).includes(value);
}

async function editor(): Promise<Storage | ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  return admin.storage ?? notConnected;
}

const isResult = (value: Storage | ActionResult): value is ActionResult => 'ok' in value;

/** Stores a concept. A concept identical to the live version is removed instead. */
async function writeDraft(storage: Storage, section: SectionKey, input: unknown): Promise<ActionResult> {
  const { data, problems } = sanitizeSection(section, input);
  const states = await getSectionStates(storage);
  const same = JSON.stringify(data) === JSON.stringify(states[section].published);
  await storage.commit({
    ...(same ? { remove: [draftPath(section)] } : { write: { [draftPath(section)]: serialize(wrapSection(data)) } }),
    expected: { [draftPath(section)]: states[section].draftSha },
    message: `Beheer: concept ${section}`,
  });
  return { ok: true, message: problems.length ? 'Opgeslagen, met correcties.' : 'Concept opgeslagen.', at: new Date().toISOString(), problems };
}

export async function saveDraft(section: SectionKey, input: unknown): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  if (JSON.stringify(input ?? null).length > MAX_BYTES) return { ok: false, message: 'De inhoud is te groot om op te slaan.' };
  try {
    return await writeDraft(storage, section, input);
  } catch (error) {
    return storageFailure('Opslaan', error);
  }
}

/** Publishes one section: the concept (optionally the given content) becomes the live version. */
export async function publishSection(section: SectionKey, input?: unknown): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  if (input !== undefined && JSON.stringify(input).length > MAX_BYTES) return { ok: false, message: 'De inhoud is te groot om op te slaan.' };
  try {
    const states = await getSectionStates(storage);
    const state = states[section];
    const source = input !== undefined ? input : state.draftSha ? state.draft : undefined;
    if (source === undefined) return { ok: false, message: 'Er is geen concept om te publiceren.' };
    const { data, problems } = sanitizeSection(section, source);
    await storage.commit({
      write: { [livePath(section)]: serialize(wrapSection(data)) },
      remove: [draftPath(section)],
      expected: { [livePath(section)]: state.publishedSha, [draftPath(section)]: state.draftSha },
      message: `Beheer: ${section} gepubliceerd`,
    });
    updateTag(CONTENT_TAG);
    return { ok: true, message: liveMessage(storage, 'Gepubliceerd.'), at: new Date().toISOString(), problems };
  } catch (error) {
    return storageFailure('Publiceren', error);
  }
}

export async function publishAll(): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  try {
    const states = await getSectionStates(storage);
    const keys = SECTION_KEYS.filter((key) => states[key].draftSha);
    if (keys.length === 0) return { ok: false, message: 'Er zijn geen concepten om te publiceren.' };
    const write: Record<string, string> = {};
    const expected: Record<string, string | null> = {};
    for (const key of keys) {
      write[livePath(key)] = serialize(wrapSection(sanitizeSection(key, states[key].draft).data));
      expected[livePath(key)] = states[key].publishedSha;
      expected[draftPath(key)] = states[key].draftSha;
    }
    await storage.commit({ write, remove: keys.map(draftPath), expected, message: `Beheer: ${keys.length} onderdelen gepubliceerd` });
    updateTag(CONTENT_TAG);
    return { ok: true, message: liveMessage(storage, `${keys.length} onderde${keys.length === 1 ? 'el' : 'len'} gepubliceerd.`), at: new Date().toISOString() };
  } catch (error) {
    return storageFailure('Publiceren', error);
  }
}

export async function discardDraft(section: SectionKey): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  try {
    const states = await getSectionStates(storage);
    if (!states[section].draftSha) return { ok: true, message: 'Er was geen concept.' };
    await storage.commit({ remove: [draftPath(section)], expected: { [draftPath(section)]: states[section].draftSha }, message: `Beheer: concept ${section} verworpen` });
    return { ok: true, message: 'Concept verworpen. De gepubliceerde versie is hersteld.' };
  } catch (error) {
    return storageFailure('Verwerpen', error);
  }
}

/**
 * Puts a photo into one image slot of a section's concept (used by "Foto's vervangen").
 * The path is validated by re-shaping the whole section afterwards.
 */
export async function setSlotImage(section: SectionKey, path: (string | number)[], image: { src: string; alt: string }): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  if (!isSection(section)) return { ok: false, message: 'Onbekend onderdeel.' };
  if (!Array.isArray(path) || path.length === 0 || path.length > 8 || !path.every((part) => typeof part === 'number' || /^[a-zA-Z]+$/.test(String(part)))) {
    return { ok: false, message: 'Ongeldige plek.' };
  }
  try {
    const states = await getSectionStates(storage);
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
    return await writeDraft(storage, section, draft);
  } catch (error) {
    return storageFailure('Opslaan', error);
  }
}
