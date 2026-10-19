'use server';

import { getAdmin } from '../auth';
import type { ActionResult } from './types';

const STATUSES = ['new', 'contacted', 'completed'] as const;
export type EnquiryStatus = (typeof STATUSES)[number];

const expired: ActionResult = { ok: false, message: 'Uw sessie is verlopen. Log opnieuw in.' };
const UUID = /^[0-9a-f-]{36}$/i;

export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!UUID.test(id) || !STATUSES.includes(status)) return { ok: false, message: 'Ongeldige invoer.' };
  const { error } = await admin.supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  return { ok: true, message: 'Status bijgewerkt.' };
}

export async function saveEnquiryNotes(id: string, notes: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!UUID.test(id)) return { ok: false, message: 'Ongeldige invoer.' };
  const { error } = await admin.supabase
    .from('enquiries')
    .update({ internal_notes: notes.slice(0, 10000) })
    .eq('id', id);
  if (error) return { ok: false, message: `Opslaan mislukt: ${error.message}` };
  return { ok: true, message: 'Notities opgeslagen.', at: new Date().toISOString() };
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return expired;
  if (!UUID.test(id)) return { ok: false, message: 'Ongeldige invoer.' };
  const { error } = await admin.supabase.from('enquiries').delete().eq('id', id);
  if (error) return { ok: false, message: `Verwijderen mislukt: ${error.message}` };
  return { ok: true, message: 'Aanvraag verwijderd.' };
}
