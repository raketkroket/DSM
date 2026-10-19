import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { KeyRound } from 'lucide-react';
import { SectionEditorPage } from '@/components/admin/SectionEditorPage';
import { AdminSkeleton, adminButton } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Instellingen' };

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<AdminSkeleton />}>
        <SectionEditorPage section="settings" back={false} />
      </Suspense>
      <section aria-labelledby="account" className="rounded-2xl border border-line bg-white p-6">
        <h2 id="account" className="text-[1.1rem] font-medium text-navy">
          Account en beveiliging
        </h2>
        <p className="mt-1 max-w-[40rem] text-[0.9rem] text-muted">
          Wijzig uw wachtwoord via een herstellink per e-mail. Beheerders worden toegevoegd in Supabase (zie README).
        </p>
        <Link href="/admin/wachtwoord-vergeten" className={adminButton('secondary', 'mt-4')}>
          <KeyRound className="h-4 w-4" aria-hidden /> Wachtwoord wijzigen
        </Link>
      </section>
    </div>
  );
}
