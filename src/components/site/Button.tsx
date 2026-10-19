import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'light' | 'ghost-light' | 'text';

const styles: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-deep shadow-[0_18px_40px_-20px_rgba(17,43,70,0.7)]',
  secondary: 'border border-navy/20 bg-white/70 text-navy backdrop-blur hover:border-navy/60 hover:bg-white',
  light: 'bg-white text-navy hover:bg-mist',
  'ghost-light': 'border border-white/30 text-white hover:border-white hover:bg-white/10',
  text: 'px-0! text-navy',
};

export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `group relative inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-[0.95rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-[var(--ease-arch)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${extra}`;
}

export function ArrowBadge({ variant = 'primary' }: { variant?: Variant }) {
  const tone =
    variant === 'primary' || variant === 'ghost-light'
      ? 'bg-white/12 text-white'
      : variant === 'text'
        ? 'bg-navy text-white'
        : 'bg-navy text-white';
  return (
    <span className={`relative grid h-7 w-7 place-items-center overflow-hidden rounded-full ${tone}`} aria-hidden="true">
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-arch)] group-hover:translate-x-4 group-hover:-translate-y-4" />
      <ArrowUpRight className="absolute h-3.5 w-3.5 -translate-x-4 translate-y-4 transition-transform duration-500 ease-[var(--ease-arch)] group-hover:translate-x-0 group-hover:translate-y-0" />
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
    <Link href={href} className={buttonClass(variant, `${arrow ? 'pr-2.5' : ''} ${className}`)}>
      <span>{children}</span>
      {arrow && <ArrowBadge variant={variant} />}
    </Link>
  );
}
