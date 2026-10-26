import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { AVAILABILITY_PATH, parseJson, readLive } from '@/lib/content/files';
import type { Storage } from '@/lib/server/storage';
import { STATUSES, isValidDay, type AvailabilityDay } from './availability';

export const AVAILABILITY_TAG = 'availability';

/** Keeps only well-formed entries, sorted by day. */
export function cleanAvailability(value: unknown): AvailabilityDay[] {
  const days = (value as { days?: unknown } | undefined)?.days;
  if (!Array.isArray(days)) return [];
  const seen = new Set<string>();
  return days
    .filter((entry): entry is AvailabilityDay => {
      if (!entry || typeof entry !== 'object') return false;
      const { day, status, note } = entry as AvailabilityDay;
      if (typeof day !== 'string' || !isValidDay(day) || seen.has(day) || !STATUSES.includes(status)) return false;
      seen.add(day);
      return typeof note === 'string' || note === undefined;
    })
    .map(({ day, status, note }) => ({ day, status, note: (note ?? '').slice(0, 200) }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

/** The latest saved calendar (admin and preview), which may be newer than the deployed one. */
export async function readStoredAvailability(storage: Storage): Promise<AvailabilityDay[]> {
  const file = (await storage.read([AVAILABILITY_PATH]))[AVAILABILITY_PATH];
  return cleanAvailability(parseJson(file?.text));
}

/** The availability calendar as deployed (content/live/availability.json). */
export async function getPublicAvailability(): Promise<AvailabilityDay[]> {
  'use cache';
  cacheTag(AVAILABILITY_TAG);
  cacheLife('max');
  return cleanAvailability(await readLive('availability'));
}
