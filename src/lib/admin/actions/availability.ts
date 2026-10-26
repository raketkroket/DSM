'use server';

import { updateTag } from 'next/cache';
import { AVAILABILITY_PATH, parseJson } from '@/lib/content/files';
import { AVAILABILITY_TAG, cleanAvailability } from '@/lib/availability-server';
import { STATUSES, addDays, isValidDay, todayInAmsterdam, type AvailabilityStatus } from '@/lib/availability';
import { serialize } from '@/lib/server/storage';
import { getAdmin } from '../auth';
import { expired, liveMessage, notConnected, storageFailure } from './shared';
import type { ActionResult } from './types';

/** Sets (or clears, with status null) the availability of one or more days. */
export async function setAvailability(days: string[], status: AvailabilityStatus | null, note = ''): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!admin.storage) return notConnected;
  if (!Array.isArray(days) || days.length === 0 || days.length > 400 || !days.every(isValidDay)) {
    return { ok: false, message: 'Ongeldige datums.' };
  }
  if (status !== null && !STATUSES.includes(status)) return { ok: false, message: 'Ongeldige status.' };

  try {
    const file = (await admin.storage.read([AVAILABILITY_PATH]))[AVAILABILITY_PATH];
    // Past days are dropped as the calendar is saved, so the file never grows without limit.
    const yesterday = addDays(todayInAmsterdam(), -1);
    const selected = new Set(days);
    const kept = cleanAvailability(parseJson(file?.text)).filter((entry) => entry.day >= yesterday && !selected.has(entry.day));
    const added = status === null ? [] : days.map((day) => ({ day, status, note: String(note).trim().slice(0, 200) }));
    const next = [...kept, ...added].sort((a, b) => a.day.localeCompare(b.day));
    await admin.storage.commit({
      write: { [AVAILABILITY_PATH]: serialize({ days: next }) },
      expected: { [AVAILABILITY_PATH]: file?.sha ?? null },
      message: `Beheer: beschikbaarheid (${days.length} dag${days.length === 1 ? '' : 'en'})`,
    });
    updateTag(AVAILABILITY_TAG);
    const count = `${days.length} dag${days.length === 1 ? '' : 'en'}`;
    return { ok: true, message: liveMessage(admin.storage, status === null ? `${count} gewist.` : `${count} bijgewerkt.`) };
  } catch (error) {
    return storageFailure('Opslaan', error);
  }
}
