import 'server-only';
import { MEDIA_PATH, parseJson } from '@/lib/content/files';
import { serialize, type Storage } from '@/lib/server/storage';

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

export type Library = { items: MediaItem[]; sha: string | null };

const sorted = (items: MediaItem[]) => [...items].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));

/** The media library: content/admin/media.json in the storage. */
export async function readLibrary(storage: Storage): Promise<Library> {
  const file = (await storage.read([MEDIA_PATH]))[MEDIA_PATH];
  const parsed = parseJson(file?.text) as { items?: unknown } | undefined;
  const items = Array.isArray(parsed?.items) ? (parsed.items as MediaItem[]).filter((item) => item && typeof item.id === 'string' && typeof item.url === 'string') : [];
  return { items: sorted(items), sha: file?.sha ?? null };
}

export const serializeLibrary = (items: MediaItem[]) => serialize({ items: sorted(items) });
