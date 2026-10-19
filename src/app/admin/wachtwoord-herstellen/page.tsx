import type { Metadata } from 'next';
import { AuthShell } from '@/components/admin/AuthShell';
import { ResetForm } from '@/components/admin/AuthForms';

export const metadata: Metadata = { title: 'Nieuw wachtwoord' };

/** Reached through the recovery link; the proxy only lets signed-in (recovery) sessions in. */
export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nieuw wachtwoord" description="Kies een nieuw wachtwoord voor uw beheeraccount.">
      <ResetForm />
    </AuthShell>
  );
}
