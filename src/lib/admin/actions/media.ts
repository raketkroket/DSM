'use server';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { draftPath, MEDIA_PATH, wrapSection } from '@/lib/content/files';
import { sanitizeSection } from '@/lib/content/sanitize';
import { SECTION_KEYS } from '@/lib/content/types';
import { serialize, type Storage } from '@/lib/server/storage';
import { getAdmin } from '../auth';
import { findImageUsage, getSectionStates } from '../content';
import { readLibrary, serializeLibrary as saveLibrary, type MediaItem } from '../media';
import { expired, notConnected, storageFailure } from './shared';
import type { ActionResult } from './types';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_WIDTH = 2400;

export type { MediaItem } from '../media';

async function editor(): Promise<Storage | ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  return admin.storage ?? notConnected;
}
const isResult = (value: Storage | ActionResult): value is ActionResult => 'ok' in value;

/** Rotates by EXIF, strips metadata, limits the width and stores a compact WebP. */
async function optimise(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input, { failOn: 'error' }).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, size: info.size };
}

function validateFile(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) return 'Geen bestand ontvangen.';
  if (!ACCEPTED.has(file.type)) return `${file.name}: alleen JPG, PNG, WebP of AVIF.`;
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name}: maximaal 15 MB.`;
  return null;
}

async function prepare(storage: Storage, file: File) {
  const optimised = await optimise(file);
  const id = randomUUID();
  const path = `public/uploads/${id}.webp`;
  const sha = await storage.stage(optimised.data);
  return { id, path, url: `/uploads/${id}.webp`, sha, ...optimised };
}

export async function uploadMedia(formData: FormData): Promise<ActionResult & { items?: MediaItem[] }> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  const files = formData.getAll('files');
  if (files.length === 0) return { ok: false, message: 'Kies één of meer foto’s.' };
  if (files.length > 20) return { ok: false, message: 'Upload maximaal 20 foto’s tegelijk.' };

  try {
    const library = await readLibrary(storage);
    let order = (library.items[0]?.sort_order ?? 0) - files.length;
    const items: MediaItem[] = [];
    const blobs: { path: string; sha: string }[] = [];
    const problems: string[] = [];
    for (const file of files) {
      const invalid = validateFile(file);
      if (invalid) {
        problems.push(invalid);
        continue;
      }
      const upload = file as File;
      try {
        const stored = await prepare(storage, upload);
        blobs.push({ path: stored.path, sha: stored.sha });
        items.push({
          id: stored.id,
          url: stored.url,
          path: stored.path,
          alt: '',
          width: stored.width,
          height: stored.height,
          size_bytes: stored.size,
          original_name: upload.name.slice(0, 200),
          sort_order: order++,
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        problems.push(`${upload.name}: ${error instanceof Error ? error.message : 'uploaden mislukt'}`);
      }
    }
    if (items.length === 0) return { ok: false, message: 'Er is niets geüpload.', problems };
    await storage.commit({
      write: { [MEDIA_PATH]: saveLibrary([...items, ...library.items]) },
      blobs,
      expected: { [MEDIA_PATH]: library.sha },
      message: `Beheer: ${items.length} foto${items.length === 1 ? '' : '’s'} geüpload`,
    });
    return { ok: true, message: `${items.length} foto${items.length === 1 ? '' : '’s'} geüpload en geoptimaliseerd.`, problems, items };
  } catch (error) {
    return storageFailure('Uploaden', error);
  }
}

async function updateLibrary(change: (items: MediaItem[]) => MediaItem[] | string, message: string, done: string): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  try {
    const library = await readLibrary(storage);
    const next = change(library.items);
    if (typeof next === 'string') return { ok: false, message: next };
    await storage.commit({ write: { [MEDIA_PATH]: saveLibrary(next) }, expected: { [MEDIA_PATH]: library.sha }, message });
    return { ok: true, message: done };
  } catch (error) {
    return storageFailure('Opslaan', error);
  }
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  return updateLibrary(
    (items) => (items.some((item) => item.id === id) ? items.map((item) => (item.id === id ? { ...item, alt: String(alt).trim().slice(0, 300) } : item)) : 'Foto niet gevonden.'),
    'Beheer: alt-tekst aangepast',
    'Alt-tekst opgeslagen.',
  );
}

export async function reorderMedia(ids: string[]): Promise<ActionResult> {
  if (!Array.isArray(ids) || ids.length > 1000) return { ok: false, message: 'Ongeldige volgorde.' };
  return updateLibrary(
    (items) => items.map((item) => ({ ...item, sort_order: ids.includes(item.id) ? ids.indexOf(item.id) : ids.length + item.sort_order })),
    'Beheer: volgorde foto’s',
    'Volgorde opgeslagen.',
  );
}

export async function getMediaUsage(url: string): Promise<string[]> {
  const admin = await getAdmin();
  if (!admin?.storage) return [];
  return findImageUsage(await getSectionStates(admin.storage), url);
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  try {
    const [library, states] = await Promise.all([readLibrary(storage), getSectionStates(storage)]);
    const item = library.items.find((entry) => entry.id === id);
    if (!item) return { ok: false, message: 'Foto niet gevonden.' };
    const usage = findImageUsage(states, item.url);
    if (usage.length > 0) return { ok: false, message: 'Deze foto is nog in gebruik en kan niet worden verwijderd.', problems: usage };
    await storage.commit({
      write: { [MEDIA_PATH]: saveLibrary(library.items.filter((entry) => entry.id !== id)) },
      remove: [item.path],
      expected: { [MEDIA_PATH]: library.sha },
      message: 'Beheer: foto verwijderd',
    });
    return { ok: true, message: 'Foto verwijderd.' };
  } catch (error) {
    return storageFailure('Verwijderen', error);
  }
}

/**
 * Replaces a photo: the new file gets a new address, every concept that used the old photo is
 * updated to the new one, and the change goes live when the owner publishes.
 */
export async function replaceMedia(formData: FormData): Promise<ActionResult & { item?: MediaItem }> {
  const storage = await editor();
  if (isResult(storage)) return storage;
  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');
  const invalid = validateFile(file);
  if (invalid) return { ok: false, message: invalid };

  try {
    const [library, states] = await Promise.all([readLibrary(storage), getSectionStates(storage)]);
    const current = library.items.find((entry) => entry.id === id);
    if (!current) return { ok: false, message: 'Foto niet gevonden.' };
    const stored = await prepare(storage, file as File);
    const updated: MediaItem = {
      ...current,
      url: stored.url,
      path: stored.path,
      width: stored.width,
      height: stored.height,
      size_bytes: stored.size,
      original_name: (file as File).name.slice(0, 200),
    };

    // Point every concept at the new file.
    const write: Record<string, string> = { [MEDIA_PATH]: saveLibrary(library.items.map((entry) => (entry.id === id ? updated : entry))) };
    const expected: Record<string, string | null> = { [MEDIA_PATH]: library.sha };
    const escape = (value: string) => JSON.stringify(value).slice(1, -1);
    let touched = 0;
    for (const key of SECTION_KEYS) {
      const draft = JSON.stringify(states[key].draft);
      if (!draft.includes(escape(current.url))) continue;
      const next = JSON.parse(draft.split(escape(current.url)).join(escape(stored.url)));
      write[draftPath(key)] = serialize(wrapSection(sanitizeSection(key, next).data));
      expected[draftPath(key)] = states[key].draftSha;
      touched++;
    }
    // The old file can go once no published page still shows it.
    const stillLive = findImageUsage(states, current.url, 'published').length > 0;
    await storage.commit({
      write,
      blobs: [{ path: stored.path, sha: stored.sha }],
      remove: stillLive ? [] : [current.path],
      expected,
      message: 'Beheer: foto vervangen',
    });
    return {
      ok: true,
      message: touched ? `Foto vervangen in ${touched} onderde${touched === 1 ? 'el' : 'len'}. Publiceer om de wijziging live te zetten.` : 'Foto vervangen.',
      item: updated,
    };
  } catch (error) {
    return storageFailure('Vervangen', error);
  }
}
