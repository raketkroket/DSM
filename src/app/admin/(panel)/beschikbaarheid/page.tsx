import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AvailabilityEditor } from '@/components/admin/AvailabilityEditor';
import { AdminSkeleton, PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/auth';
import { addDays, todayInAmsterdam, type AvailabilityDay } from '@/lib/availability';

export const metadata: Metadata = { title: 'Beschikbaarheid' };

async function Editor() {
  const { supabase } = await requireAdmin();
  const today = todayInAmsterdam();
  const { data, error } = await supabase.from('availability').select('day, status, note').gte('day', addDays(today, -1)).order('day').limit(1000);
  if (error) {
    return <p className="rounded-2xl border border-danger/30 bg-white p-6 text-danger">De beschikbaarheid kon niet worden geladen: {error.message}</p>;
  }
  return <AvailabilityEditor initial={(data ?? []) as AvailabilityDay[]} serverToday={today} />;
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
