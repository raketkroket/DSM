import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { toDay, type AvailabilityDay } from './availability';

export const AVAILABILITY_TAG = 'availability';

/** Published availability from yesterday onwards, cached until an admin changes it (and refreshed daily). */
export async function getPublicAvailability(): Promise<AvailabilityDay[]> {
  'use cache';
  cacheTag(AVAILABILITY_TAG);
  const supabase = createPublicClient();
  if (!supabase) {
    cacheLife('max');
    return [];
  }
  const since = new Date();
  since.setDate(since.getDate() - 1);
  const { data, error } = await supabase
    .from('availability')
    .select('day, status, note')
    .gte('day', toDay(since))
    .order('day')
    .limit(500);
  if (error) {
    console.error('Beschikbaarheid laden mislukt:', error.message);
    cacheLife('minutes');
    return [];
  }
  cacheLife('days');
  return (data ?? []) as AvailabilityDay[];
}
