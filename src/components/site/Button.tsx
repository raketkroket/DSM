import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'light' | 'ghost-light' | 'text';

const styles: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-deep',
  secondary: 'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white',
  light: 'bg-white text-navy hover:bg-paper',
  'ghost-light': 'border border-white/35 text-white hover:border-white hover:bg-white hover:text-navy',
  text: 'px-0! min-h-0! text-navy',
};

/** Architectural buttons: square corners, quiet weight, an arrow that travels on hover. */
export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `group relative inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-[2px] px-6 text-[0.95rem] font-medium tracking-[-0.005em] transition-[background-color,border-color,color] duration-500 ease-[var(--ease-arch)] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${extra}`;
}

/** Arrow that slides out and back in on hover (two stacked icons, clipped). */
export function ArrowBadge({ variant = 'primary' }: { variant?: Variant }) {
  void variant;
  return (
    <span className="relative grid h-4 w-4 place-items-center overflow-hidden" aria-hidden="true">
      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-arch)] group-hover:translate-x-5" strokeWidth={1.75} />
      <ArrowRight className="absolute h-4 w-4 -translate-x-5 transition-transform duration-500 ease-[var(--ease-arch)] group-hover:translate-x-0" strokeWidth={1.75} />
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      <span>{children}</span>
      {arrow && <ArrowBadge variant={variant} />}
    </Link>
  );
}
