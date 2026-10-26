import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/admin/AuthShell';
import { LoginForm } from '@/components/admin/AuthForms';
import { getAdmin, safeNext } from '@/lib/admin/auth';
import { adminConfig } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Inloggen' };

async function Login({ searchParams }: { searchParams: PageProps<'/admin/login'>['searchParams'] }) {
  const params = await searchParams;
  if (await getAdmin()) redirect('/admin');
  if (!adminConfig().ready) {
    return (
      <div role="alert" className="rounded-2xl border border-warning/30 bg-warning/5 p-5 text-[0.9rem] leading-relaxed text-ink">
        <p className="font-medium text-navy">Het inloggen is nog niet ingesteld.</p>
        <p className="mt-2 text-muted">
          Stel <code className="rounded bg-mist px-1">ADMIN_PASSWORD_HASH</code> en <code className="rounded bg-mist px-1">ADMIN_SESSION_SECRET</code> in
          (maak ze met <code className="rounded bg-mist px-1">npm run admin:wachtwoord</code>). De stappen staan in de README.
        </p>
      </div>
    );
  }
  return <LoginForm next={safeNext(params.volgende)} notice={params.uitgelogd ? 'U bent uitgelogd.' : undefined} />;
}

export default function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  return (
    <AuthShell title="Inloggen" description="Log in om de website, foto’s en uw beschikbaarheid te beheren.">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-mist" />}>
        <Login searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
