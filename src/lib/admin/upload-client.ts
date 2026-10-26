'use client';

import { replaceMedia, uploadMedia, type MediaItem } from '@/lib/admin/actions/media';

/** Vercel accepts request bodies up to 4.5 MB; stay well under it. */
const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_SIDE = 2400;

/**
 * Shrinks a large photo in the browser before it is sent (the server optimises it again).
 * Small files and formats the browser cannot draw are sent unchanged.
 */
export async function shrinkForUpload(file: File): Promise<File> {
  if (file.size <= MAX_BYTES || typeof createImageBitmap !== 'function') return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.9, 0.82, 0.72, 0.6]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= MAX_BYTES) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  }
  return file;
}

/** Uploads photos one request at a time and combines the results. */
export async function uploadPhotos(files: Iterable<File>): Promise<{ ok: boolean; message: string; problems: string[]; items: MediaItem[] }> {
  const items: MediaItem[] = [];
  const problems: string[] = [];
  let lastError = '';
  for (const file of files) {
    const data = new FormData();
    data.append('files', await shrinkForUpload(file));
    try {
      const result = await uploadMedia(data);
      if (result.ok && 'items' in result && result.items) items.push(...result.items);
      else lastError = result.message;
      problems.push(...(result.problems ?? []));
    } catch {
      problems.push(`${file.name}: uploaden mislukt (te groot of geen verbinding).`);
    }
  }
  if (items.length === 0) return { ok: false, message: lastError || 'Er is niets geüpload.', problems, items };
  return { ok: true, message: `${items.length} foto${items.length === 1 ? '' : '’s'} geüpload en geoptimaliseerd.`, problems, items };
}

export async function replacePhoto(id: string, file: File) {
  const data = new FormData();
  data.append('id', id);
  data.append('file', await shrinkForUpload(file));
  try {
    return await replaceMedia(data);
  } catch {
    return { ok: false as const, message: 'Vervangen mislukt (te groot of geen verbinding).' };
  }
}
