'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { requestPasswordReset, signIn, updatePassword, type AuthState } from '@/lib/admin/actions/auth';
import { adminButton } from './ui';

const input =
  'mt-2 block h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[0.98rem] outline-none transition focus:border-navy focus:shadow-[0_0_0_4px_rgba(110,145,172,0.18)]';

function Message({ state }: { state: AuthState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-[0.88rem] text-danger">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p role="status" className="rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-[0.88rem] text-success">
        {state.success}
      </p>
    );
  return null;
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className={adminButton('primary', 'h-12 w-full text-[0.95rem]')}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {label}
    </button>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="space-y-5">
      {notice && !state.error && (
        <p role="status" className="rounded-xl border border-line bg-mist px-4 py-3 text-[0.88rem] text-ink">
          {notice}
        </p>
      )}
      <Message state={state} />
      <input type="hidden" name="volgende" value={next} />
      <label className="block text-[0.9rem] font-medium text-navy">
        E-mailadres
        <input name="email" type="email" required autoComplete="username" defaultValue={state.email} className={input} />
      </label>
      <label className="block text-[0.9rem] font-medium text-navy">
        <span className="flex items-center justify-between">
          Wachtwoord
          <Link href="/admin/wachtwoord-vergeten" className="text-[0.82rem] font-normal text-steel hover:text-navy">
            Wachtwoord vergeten?
          </Link>
        </span>
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      <Submit pending={pending} label="Inloggen" />
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-5">
      <Message state={state} />
      <label className="block text-[0.9rem] font-medium text-navy">
        E-mailadres
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <Submit pending={pending} label="Stuur herstellink" />
      <Link href="/admin/login" className="block text-center text-[0.88rem] text-steel hover:text-navy">
        Terug naar inloggen
      </Link>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form action={action} className="space-y-5">
      <Message state={state} />
      <label className="block text-[0.9rem] font-medium text-navy">
        Nieuw wachtwoord
        <input name="password" type="password" required minLength={12} autoComplete="new-password" className={input} />
      </label>
      <label className="block text-[0.9rem] font-medium text-navy">
        Herhaal wachtwoord
        <input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} />
      </label>
      <p className="text-[0.82rem] text-muted">Gebruik minimaal 12 tekens.</p>
      <Submit pending={pending} label="Wachtwoord opslaan" />
    </form>
  );
}
