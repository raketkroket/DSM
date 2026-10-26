import Image from 'next/image';
import type { ImageRef } from '@/lib/content/types';
import logoDark from '../../../public/images/brand/dsm-logo.png';
import logoLight from '../../../public/images/brand/dsm-logo-light.png';

/** The DSM letter mark. `light` is the version for dark backgrounds (white and light grey). */
export function LogoMark({ tone = 'dark', className = 'h-9', alt = '', priority = false }: { tone?: 'dark' | 'light'; className?: string; alt?: string; priority?: boolean }) {
  return <Image src={tone === 'light' ? logoLight : logoDark} alt={alt} className={`w-auto ${className}`} sizes="120px" priority={priority} />;
}

export function Logo({
  tone = 'dark',
  image,
  compact = false,
  priority = false,
}: {
  tone?: 'dark' | 'light';
  image?: ImageRef;
  compact?: boolean;
  priority?: boolean;
}) {
  if (image?.src) {
    return (
      <span className="relative block h-10 w-44">
        <Image src={image.src} alt={image.alt || 'Dedicated Security Management B.V.'} fill sizes="176px" className="object-contain object-left" priority={priority} />
      </span>
    );
  }
  if (compact) return <LogoMark tone={tone} alt="Dedicated Security Management B.V." priority={priority} />;
  return (
    <span className={`flex items-center gap-3.5 ${tone === 'light' ? 'text-white' : 'text-navy'}`}>
      <LogoMark tone={tone} priority={priority} />
      <span className={`h-8 w-px max-[379px]:hidden ${tone === 'light' ? 'bg-white/25' : 'bg-line-strong'}`} aria-hidden />
      <span className="flex flex-col leading-none max-[379px]:sr-only">
        <span className="text-[0.98rem] font-semibold tracking-[-0.02em]">Dedicated</span>{' '}
        <span className={`mt-1 font-mono text-[0.54rem] tracking-[0.2em] uppercase ${tone === 'light' ? 'text-white/65' : 'text-muted'}`}>
          Security Management
        </span>
      </span>
    </span>
  );
}
