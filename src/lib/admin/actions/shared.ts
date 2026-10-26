import 'server-only';
import { ConflictError, type Storage } from '@/lib/server/storage';
import type { ActionResult } from './types';

export const expired: ActionResult = { ok: false, message: 'Uw sessie is verlopen. Log opnieuw in.' };
export const notConnected: ActionResult = { ok: false, message: 'De opslag is nog niet gekoppeld (GITHUB_CONTENT_TOKEN). Neem contact op met uw websitebouwer.' };

/** On GitHub storage a change goes live after Vercel has rebuilt the site. */
export function liveMessage(storage: Storage, done: string) {
  return storage.kind === 'github' ? `${done} De website is over één à twee minuten bijgewerkt.` : `${done} De wijzigingen staan live.`;
}

export function storageFailure(what: string, error: unknown): ActionResult {
  if (error instanceof ConflictError) return { ok: false, message: error.message };
  console.error(`${what} mislukt:`, error instanceof Error ? error.message : error);
  return { ok: false, message: `${what} mislukt. Probeer het over een minuut opnieuw.` };
}
