import Image from 'next/image';
import type { ImageRef } from '@/lib/content/types';

/** Monogram: a "D" drawn as a doorway — a threshold inside a protective frame. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <rect x="1" y="1" width="38" height="38" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9.5h7.5c6.4 0 10.5 4.3 10.5 10.5s-4.1 10.5-10.5 10.5H12z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 15.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <path d="M8 34.5h24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" opacity=".55" />
    </svg>
  );
}

export function Logo({
  tone = 'dark',
  image,
  compact = false,
}: {
  tone?: 'dark' | 'light';
  image?: ImageRef;
  compact?: boolean;
}) {
  if (image?.src) {
    return (
      <span className="relative block h-10 w-44">
        <Image src={image.src} alt={image.alt || 'Dedicated Security Management B.V.'} fill sizes="176px" className="object-contain object-left" />
      </span>
    );
  }
  const color = tone === 'light' ? 'text-white' : 'text-navy';
  return (
    <span className={`flex items-center gap-3 ${color}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">Dedicated</span>
          <span className={`mt-1 font-mono text-[0.56rem] tracking-[0.22em] uppercase ${tone === 'light' ? 'text-white/60' : 'text-muted'}`}>
            Security Management
          </span>
        </span>
      )}
    </span>
  );
}
