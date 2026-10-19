import type { Metadata } from 'next';
import { AuthShell } from '@/components/admin/AuthShell';
import { ForgotForm } from '@/components/admin/AuthForms';

export const metadata: Metadata = { title: 'Wachtwoord vergeten' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Wachtwoord vergeten" description="Vul uw e-mailadres in. U ontvangt een link om een nieuw wachtwoord in te stellen.">
      <ForgotForm />
    </AuthShell>
  );
}
