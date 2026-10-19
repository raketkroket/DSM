import { Suspense } from 'react';
import { LogOut } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAdmin } from '@/lib/admin/auth';
import { signOut } from '@/lib/admin/actions/auth';

/** The admin area is per-request by nature; it may block instead of serving a static shell. */
export const instant = false;

async function Account() {
  const admin = await getAdmin();
  return (
    <div className="px-2">
      <p className="truncate text-[0.82rem] text-muted" title={admin?.user.email}>
        {admin?.user.email ?? '—'}
      </p>
      <form action={signOut} className="mt-2">
        <button type="submit" className="flex items-center gap-2 text-[0.85rem] text-navy hover:underline">
          <LogOut className="h-4 w-4" aria-hidden /> Uitloggen
        </button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <AdminShell
      account={
        <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-mist" />}>
          <Account />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
