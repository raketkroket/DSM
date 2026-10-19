import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/admin/AuthShell';
import { LoginForm } from '@/components/admin/AuthForms';
import { getAdmin, safeNext } from '@/lib/admin/auth';
import { isSupabaseConfigured } from '@/lib/env';

export const metadata: Metadata = { title: 'Inloggen' };

async function Login({ searchParams }: { searchParams: PageProps<'/admin/login'>['searchParams'] }) {
  const params = await searchParams;
  if (await getAdmin()) redirect('/admin');
  const notice = params.uitgelogd ? 'U bent uitgelogd.' : params.fout === 'link' ? 'De link is ongeldig of verlopen. Vraag een nieuwe link aan.' : undefined;
  return <LoginForm next={safeNext(params.volgende)} notice={notice} />;
}

export default function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  return (
    <AuthShell title="Inloggen" description="Log in om de website, aanvragen en foto’s te beheren.">
      {!isSupabaseConfigured() ? (
        <div role="alert" className="rounded-2xl border border-warning/30 bg-warning/5 p-5 text-[0.9rem] leading-relaxed text-ink">
          <p className="font-medium text-navy">Supabase is nog niet gekoppeld.</p>
          <p className="mt-2 text-muted">
            Stel <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_URL</code> en <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
            en voer de database-migratie uit. De stappen staan in de README.
          </p>
        </div>
      ) : (
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-mist" />}>
          <Login searchParams={searchParams} />
        </Suspense>
      )}
    </AuthShell>
  );
}
