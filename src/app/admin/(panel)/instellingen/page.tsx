import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KeyRound } from 'lucide-react';
import { SectionEditorPage } from '@/components/admin/SectionEditorPage';
import { AdminSkeleton } from '@/components/admin/ui';

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
        <p className="mt-1 flex max-w-[44rem] gap-3 text-[0.9rem] leading-relaxed text-muted">
          <KeyRound className="mt-1 h-4 w-4 shrink-0 text-steel" aria-hidden />
          Uw wachtwoord wordt niet op de website zelf bewaard, alleen een versleutelde versie bij de hosting. Wilt u een nieuw wachtwoord, of denkt u dat iemand anders
          het kent? Vraag uw websitebouwer om het te wijzigen; alle bestaande sessies worden dan direct beëindigd.
        </p>
      </section>
    </div>
  );
}
