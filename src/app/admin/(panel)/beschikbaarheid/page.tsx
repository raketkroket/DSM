import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AvailabilityEditor } from '@/components/admin/AvailabilityEditor';
import { AdminSkeleton, PageHeader } from '@/components/admin/ui';
import { requireEditor } from '@/lib/admin/auth';
import { addDays, todayInAmsterdam } from '@/lib/availability';
import { readStoredAvailability } from '@/lib/availability-server';

export const metadata: Metadata = { title: 'Beschikbaarheid' };

async function Editor() {
  const { storage } = await requireEditor();
  const today = todayInAmsterdam();
  const days = (await readStoredAvailability(storage)).filter((entry) => entry.day >= addDays(today, -1));
  return <AvailabilityEditor initial={days} serverToday={today} />;
}

export default function AvailabilityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Planning"
        title="Beschikbaarheid"
        description="Geef per dag aan of u beschikbaar bent. Bezoekers zien dit op de contactpagina en bij het kiezen van een startdatum in het offerteformulier."
      />
      <Suspense fallback={<AdminSkeleton />}>
        <Editor />
      </Suspense>
    </div>
  );
}
