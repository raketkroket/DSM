'use client';

import { Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { signIn, type AuthState } from '@/lib/admin/actions/auth';
import { adminButton } from './ui';

const input =
  'mt-2 block h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[0.98rem] outline-none transition focus:border-navy focus:shadow-[0_0_0_4px_rgba(110,145,172,0.18)]';

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5">
      {notice && !state.error && (
        <p role="status" className="rounded-xl border border-line bg-mist px-4 py-3 text-[0.88rem] text-ink">
          {notice}
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-[0.88rem] text-danger">
          {state.error}
        </p>
      )}
      <input type="hidden" name="volgende" value={next} />
      <label className="block text-[0.9rem] font-medium text-navy">
        Gebruikersnaam
        <input
          name="username"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={state.username}
          className={input}
        />
      </label>
      <label className="block text-[0.9rem] font-medium text-navy">
        Wachtwoord
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      <button type="submit" disabled={pending} className={adminButton('primary', 'h-12 w-full text-[0.95rem]')}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Inloggen
      </button>
      <p className="text-[0.82rem] leading-relaxed text-muted">Wachtwoord vergeten? Neem contact op met uw websitebouwer; die stelt een nieuw wachtwoord in.</p>
    </form>
  );
}
