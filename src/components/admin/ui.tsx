import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="font-mono text-[0.66rem] tracking-[0.16em] text-steel uppercase">{eyebrow}</p>}
        <h1 className="mt-2 text-[1.9rem] leading-tight font-medium tracking-[-0.03em] text-navy">{title}</h1>
        {description && <p className="mt-2 max-w-[44rem] text-[0.95rem] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(17,43,70,0.04)] ${className}`}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-[1rem] font-medium tracking-[-0.01em] text-navy">{title}</h2>
        {description && <p className="mt-0.5 text-[0.85rem] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const badgeTones = {
  neutral: 'bg-mist text-ink',
  navy: 'bg-navy text-white',
  steel: 'bg-steel-wash text-navy',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium whitespace-nowrap ${badgeTones[tone]}`}>{children}</span>;
}

const buttonTones = {
  primary: 'bg-navy text-white hover:bg-navy-deep',
  secondary: 'border border-line-strong bg-white text-navy hover:border-navy',
  ghost: 'text-muted hover:bg-mist hover:text-navy',
  danger: 'border border-danger/30 bg-white text-danger hover:bg-danger hover:text-white',
};

export function adminButton(tone: keyof typeof buttonTones = 'primary', extra = '') {
  return `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[0.88rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonTones[tone]} ${extra}`;
}

export function Button({ tone = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof buttonTones }) {
  return <button type="button" className={adminButton(tone, className)} {...props} />;
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-steel">{icon}</span>
      <p className="mt-4 text-[1rem] font-medium text-navy">{title}</p>
      <p className="mt-1 max-w-[26rem] text-[0.9rem] leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Laden" role="status">
      <div className="h-10 w-64 rounded-xl bg-mist" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-mist" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-mist" />
    </div>
  );
}

export const STATUS_LABEL = { new: 'Nieuw', contacted: 'Gecontacteerd', completed: 'Afgerond' } as const;
export const STATUS_TONE = { new: 'navy', contacted: 'warning', completed: 'success' } as const;
export const KIND_LABEL = { quote: 'Offerte', contact: 'Bericht' } as const;

export function formatDate(value: string | null | undefined, withTime = true) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Amsterdam',
  }).format(new Date(value));
}
