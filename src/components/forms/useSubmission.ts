'use client';

import { useEffect, useRef, useState } from 'react';
import type { FieldErrors } from '@/lib/enquiry/schema';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Shared submit logic: one stable token per form session (so retries are deduplicated
 * server-side), the time the form was opened (bot check) and guarded double submits.
 */
export function useSubmission(endpoint: string) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const startedAt = useRef(0);
  const token = useRef<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(payload: Record<string, unknown>): Promise<{ ok: boolean; errors: FieldErrors }> {
    if (inFlight.current) return { ok: false, errors: {} };
    inFlight.current = true;
    token.current ??= crypto.randomUUID();
    setStatus('submitting');
    setMessage('');
    setServerErrors({});
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, startedAt: startedAt.current, token: token.current }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string; errors?: FieldErrors };
      if (response.ok) {
        setStatus('success');
        setMessage(body.message ?? '');
        return { ok: true, errors: {} };
      }
      setStatus('error');
      setMessage(body.message ?? 'Er ging iets mis. Probeer het opnieuw.');
      setServerErrors(body.errors ?? {});
      return { ok: false, errors: body.errors ?? {} };
    } catch {
      setStatus('error');
      setMessage('Geen verbinding. Controleer uw internetverbinding en probeer het opnieuw.');
      return { ok: false, errors: {} };
    } finally {
      inFlight.current = false;
    }
  }

  const clearError = (key: string) =>
    setServerErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));

  return { status, message, serverErrors, submit, clearError };
}
