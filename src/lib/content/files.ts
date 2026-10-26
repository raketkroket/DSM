import 'server-only';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { SectionKey } from './types';

/** Repository paths of everything the admin saves (see src/lib/server/storage.ts). */
export const livePath = (key: SectionKey) => `content/live/${key}.json`;
export const draftPath = (key: SectionKey) => `content/admin/drafts/${key}.json`;
export const AVAILABILITY_PATH = 'content/live/availability.json';
export const MEDIA_PATH = 'content/admin/media.json';

/**
 * Reads content/live/<name>.json as shipped with this deployment (published content, availability).
 * A missing or broken file means "nothing saved yet": callers fall back to the defaults.
 * The path stays statically scoped to content/live, so only that folder is traced into the server bundle.
 */
export async function readLive(name: SectionKey | 'availability'): Promise<unknown> {
  const file = path.join(process.cwd(), 'content', 'live', `${name}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    console.error(`Kon content/live/${name}.json niet lezen:`, error instanceof Error ? error.message : error);
    return undefined;
  }
}

/** Saved sections are stored as { updatedAt, content }. */
export const wrapSection = (content: unknown, at = new Date().toISOString()) => ({ updatedAt: at, content });

export function unwrapSection(value: unknown): { content: unknown; updatedAt: string | null } {
  if (!value || typeof value !== 'object' || !('content' in value)) return { content: undefined, updatedAt: null };
  const record = value as { content: unknown; updatedAt?: unknown };
  return { content: record.content, updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null };
}

export function parseJson(text: string | undefined | null): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
