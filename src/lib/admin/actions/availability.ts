'use server';

import { updateTag } from 'next/cache';
import { AVAILABILITY_TAG } from '@/lib/availability-server';
import { STATUSES, isValidDay, type AvailabilityStatus } from '@/lib/availability';
import { getAdmin } from '../auth';
import type { ActionResult } from './types';

const expired: ActionResult = { ok: false, message: 'Uw sessie is verlopen. Log opnieuw in.' };

/** Sets (or clears, with status null) the availability of one or more days. */
export async function setAvailability(days: string[], status: AvailabilityStatus | null, note = ''): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!Array.isArray(days) || days.length === 0 || days.length > 400 || !days.every(isValidDay)) {
    return { ok: false, message: 'Ongeldige datums.' };
  }
  if (status !== null && !STATUSES.includes(status)) return { ok: false, message: 'Ongeldige status.' };

  if (status === null) {
    const { error } = await admin.supabase.from('availability').delete().in('day', days);
    if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  } else {
    const at = new Date().toISOString();
    const rows = days.map((day) => ({ day, status, note: note.trim().slice(0, 200), updated_at: at, updated_by: admin.user.id }));
    const { error } = await admin.supabase.from('availability').upsert(rows, { onConflict: 'day' });
    if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  }
  updateTag(AVAILABILITY_TAG);
  return {
    ok: true,
    message: status === null ? `${days.length} dag${days.length === 1 ? '' : 'en'} gewist.` : `${days.length} dag${days.length === 1 ? '' : 'en'} bijgewerkt. Direct zichtbaar op de website.`,
  };
}
