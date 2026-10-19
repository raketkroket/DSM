import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy-deep p-12 text-white lg:flex lg:flex-col">
        <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <Logo tone="light" />
        </div>
        <div className="relative mt-auto">
          <p className="font-mono text-[0.66rem] tracking-[0.18em] text-steel-soft uppercase">Beheeromgeving</p>
          <p className="mt-5 max-w-[16ch] text-[3.2rem] leading-[1] font-medium tracking-[-0.045em]">
            Uw veiligheid, <span className="accent text-steel-soft">onze verantwoordelijkheid.</span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-paper px-4 py-12">
        <div className="w-full max-w-[25rem]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[1.9rem] leading-tight font-medium tracking-[-0.03em] text-navy">{title}</h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
