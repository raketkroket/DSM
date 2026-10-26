'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ExternalLink, FileText, Image as ImageIcon, ImageUp, Inbox, LayoutDashboard, Menu, Settings, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { LogoMark } from '@/components/brand/Logo';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/aanvragen', label: 'Aanvragen', icon: Inbox },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/beschikbaarheid', label: 'Beschikbaarheid', icon: CalendarDays },
  { href: '/admin/fotos', label: 'Foto’s vervangen', icon: ImageUp },
  { href: '/admin/media', label: 'Mediabibliotheek', icon: ImageIcon },
  { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
];

export function AdminShell({ children, account }: { children: ReactNode; account: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Beheer" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href, exact) ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] transition-colors ${
            active(href, exact) ? 'bg-navy text-white' : 'text-ink/75 hover:bg-mist hover:text-navy'
          }`}
        >
          <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-2 text-navy">
        <LogoMark className="h-8" alt="Dedicated Security Management" />
        <span className="border-l border-line-strong pl-3 font-mono text-[0.6rem] tracking-[0.2em] text-muted uppercase">Beheer</span>
      </Link>
      <div className="mt-8 flex-1">{nav}</div>
      <a href="/" target="_blank" rel="noopener" className="mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.88rem] text-muted hover:bg-mist hover:text-navy">
        <ExternalLink className="h-4 w-4" aria-hidden /> Bekijk website
      </a>
      <div className="border-t border-line pt-4">{account}</div>
    </div>
  );

  return (
    <div className="min-h-svh bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-6 lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5 text-navy">
          <LogoMark className="h-7" alt="Dedicated Security Management" />
          <span className="text-[0.95rem] font-semibold">Beheer</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-line" aria-label="Menu openen" aria-expanded={open}>
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Beheermenu">
          <button type="button" className="absolute inset-0 bg-navy-deep/40" aria-label="Menu sluiten" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white px-4 py-6 shadow-panel">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-5 right-4 grid h-9 w-9 place-items-center rounded-lg hover:bg-mist" aria-label="Menu sluiten">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-[78rem] px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
