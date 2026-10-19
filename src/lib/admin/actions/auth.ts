'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { env, isSupabaseConfigured } from '@/lib/env';
import { createSessionClient } from '@/lib/supabase/server';
import { safeNext } from '../auth';

export type AuthState = { error?: string; success?: string; email?: string };

const notConfigured: AuthState = { error: 'Supabase is nog niet gekoppeld. Zie de installatie-instructies in de README.' };

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return notConfigured;
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get('email'), password: formData.get('password') });
  const email = String(formData.get('email') ?? '');
  if (!parsed.success) return { error: 'Vul een geldig e-mailadres en wachtwoord in.', email };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    // Same message for unknown accounts and wrong passwords.
    return { error: 'Onjuist e-mailadres of wachtwoord.', email };
  }
  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'Dit account heeft geen toegang tot het beheer.', email };
  }
  redirect(safeNext(formData.get('volgende')));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect('/admin/login?uitgelogd=1');
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return notConfigured;
  const parsed = z.email().safeParse(formData.get('email'));
  if (!parsed.success) return { error: 'Vul een geldig e-mailadres in.' };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${env.siteUrl}/admin/auth/bevestigen?volgende=/admin/wachtwoord-herstellen`,
  });
  if (error && error.status !== 429) console.error('Wachtwoordherstel mislukt:', error.message);
  if (error?.status === 429) return { error: 'Te veel verzoeken. Probeer het over enkele minuten opnieuw.' };
  // Never reveal whether an account exists.
  return { success: 'Als dit e-mailadres bij een beheerder hoort, ontvangt u binnen enkele minuten een herstellink.' };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return notConfigured;
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (password.length < 12) return { error: 'Gebruik minimaal 12 tekens.' };
  if (password !== confirm) return { error: 'De wachtwoorden komen niet overeen.' };
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'De herstellink is verlopen. Vraag een nieuwe link aan.' };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message.includes('different') ? 'Kies een ander wachtwoord dan het huidige.' : 'Wachtwoord wijzigen mislukt. Probeer het opnieuw.' };
  redirect('/admin?wachtwoord=gewijzigd');
}
