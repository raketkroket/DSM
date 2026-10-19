'use server';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { sanitizeSection } from '@/lib/content/sanitize';
import { SECTION_KEYS } from '@/lib/content/types';
import { getAdmin, type AdminContext } from '../auth';
import { findImageUsage, getSectionStates } from '../content';
import type { ActionResult } from './types';

const BUCKET = 'media';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_WIDTH = 2400;

export type MediaItem = {
  id: string;
  url: string;
  path: string;
  alt: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  original_name: string | null;
  sort_order: number;
  created_at: string;
};

const expired: ActionResult = { ok: false, message: 'Uw sessie is verlopen. Log opnieuw in.' };

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

async function store(admin: AdminContext, file: File) {
  const optimised = await optimise(file);
  const path = `${new Date().getFullYear()}/${randomUUID()}.webp`;
  const { error } = await admin.supabase.storage.from(BUCKET).upload(path, optimised.data, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = admin.supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl, ...optimised };
}

export async function uploadMedia(formData: FormData): Promise<ActionResult & { items?: MediaItem[] }> {
  const admin = await getAdmin();
  if (!admin) return expired;
  const files = formData.getAll('files');
  if (files.length === 0) return { ok: false, message: 'Kies één of meer foto’s.' };
  if (files.length > 20) return { ok: false, message: 'Upload maximaal 20 foto’s tegelijk.' };

  const { data: first } = await admin.supabase.from('media').select('sort_order').order('sort_order', { ascending: true }).limit(1).maybeSingle();
  let order = (first?.sort_order ?? 0) - files.length;

  const items: MediaItem[] = [];
  const problems: string[] = [];
  for (const file of files) {
    const invalid = validateFile(file);
    if (invalid) {
      problems.push(invalid);
      continue;
    }
    const upload = file as File;
    try {
      const stored = await store(admin, upload);
      const { data, error } = await admin.supabase
        .from('media')
        .insert({
          path: stored.path,
          url: stored.url,
          alt: '',
          width: stored.width,
          height: stored.height,
          size_bytes: stored.size,
          original_name: upload.name.slice(0, 200),
          sort_order: order++,
          uploaded_by: admin.user.id,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      items.push(data as MediaItem);
    } catch (error) {
      problems.push(`${upload.name}: ${error instanceof Error ? error.message : 'uploaden mislukt'}`);
    }
  }
  if (items.length === 0) return { ok: false, message: 'Er is niets geüpload.', problems };
  return {
    ok: true,
    message: `${items.length} foto${items.length === 1 ? '' : '’s'} geüpload en geoptimaliseerd.`,
    problems,
    items,
  };
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  const { error } = await admin.supabase
    .from('media')
    .update({ alt: alt.trim().slice(0, 300), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  return { ok: true, message: 'Alt-tekst opgeslagen.' };
}

export async function reorderMedia(ids: string[]): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!Array.isArray(ids) || ids.length > 1000) return { ok: false, message: 'Ongeldige volgorde.' };
  const results = await Promise.all(ids.map((id, index) => admin.supabase.from('media').update({ sort_order: index }).eq('id', id)));
  const failed = results.find((result) => result.error);
  if (failed?.error) return { ok: false, message: `Volgorde opslaan mislukt: ${failed.error.message}` };
  return { ok: true, message: 'Volgorde opgeslagen.' };
}

export async function getMediaUsage(url: string): Promise<string[]> {
  const admin = await getAdmin();
  if (!admin) return [];
  const states = await getSectionStates(admin.supabase);
  return findImageUsage(states, url);
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  const { data: item, error } = await admin.supabase.from('media').select('id, path, url').eq('id', id).single();
  if (error || !item) return { ok: false, message: 'Foto niet gevonden.' };

  const usage = findImageUsage(await getSectionStates(admin.supabase), item.url);
  if (usage.length > 0) {
    return { ok: false, message: 'Deze foto is nog in gebruik en kan niet worden verwijderd.', problems: usage };
  }
  const { error: storageError } = await admin.supabase.storage.from(BUCKET).remove([item.path]);
  if (storageError) return { ok: false, message: `Verwijderen mislukt: ${storageError.message}` };
  const { error: deleteError } = await admin.supabase.from('media').delete().eq('id', id);
  if (deleteError) return { ok: false, message: `Verwijderen mislukt: ${deleteError.message}` };
  return { ok: true, message: 'Foto verwijderd.' };
}

/**
 * Replaces a photo: the new file gets a new address, every concept that used the old photo is
 * updated to the new one, and the change goes live when the owner publishes.
 */
export async function replaceMedia(formData: FormData): Promise<ActionResult & { item?: MediaItem }> {
  const admin = await getAdmin();
  if (!admin) return expired;
  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');
  const invalid = validateFile(file);
  if (invalid) return { ok: false, message: invalid };

  const { data: current, error } = await admin.supabase.from('media').select('*').eq('id', id).single();
  if (error || !current) return { ok: false, message: 'Foto niet gevonden.' };

  let stored;
  try {
    stored = await store(admin, file as File);
  } catch (uploadError) {
    return { ok: false, message: `Uploaden mislukt: ${uploadError instanceof Error ? uploadError.message : ''}` };
  }

  const { data: updated, error: updateError } = await admin.supabase
    .from('media')
    .update({
      path: stored.path,
      url: stored.url,
      width: stored.width,
      height: stored.height,
      size_bytes: stored.size,
      original_name: (file as File).name.slice(0, 200),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (updateError) return { ok: false, message: `Vervangen mislukt: ${updateError.message}` };

  // Point every concept at the new file.
  const states = await getSectionStates(admin.supabase);
  let touched = 0;
  for (const key of SECTION_KEYS) {
    const draft = JSON.stringify(states[key].draft);
    if (!draft.includes(current.url)) continue;
    const next = JSON.parse(draft.split(JSON.stringify(current.url).slice(1, -1)).join(JSON.stringify(stored.url).slice(1, -1)));
    const { data } = sanitizeSection(key, next);
    await admin.supabase
      .from('content_drafts')
      .upsert({ key, data, updated_at: new Date().toISOString(), updated_by: admin.user.id }, { onConflict: 'key' });
    touched++;
  }

  // The old file can go once no published page still shows it.
  const stillLive = findImageUsage(await getSectionStates(admin.supabase), current.url).length > 0;
  if (!stillLive) await admin.supabase.storage.from(BUCKET).remove([current.path]);

  return {
    ok: true,
    message: touched
      ? `Foto vervangen in ${touched} onderde${touched === 1 ? 'el' : 'len'}. Publiceer om de wijziging live te zetten.`
      : 'Foto vervangen.',
    item: updated as MediaItem,
  };
}
