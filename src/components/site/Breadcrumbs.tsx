import Link from 'next/link';

export function Breadcrumbs({ items, tone = 'dark' }: { items: { name: string; href?: string }[]; tone?: 'dark' | 'light' }) {
  const muted = tone === 'light' ? 'text-white/55' : 'text-muted';
  const strong = tone === 'light' ? 'text-white' : 'text-navy';
  const hover = tone === 'light' ? 'hover:text-white' : 'hover:text-navy';
  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            {index > 0 && <span className={muted} aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className={`${muted} transition-colors ${hover}`}>
                {item.name}
              </Link>
            ) : (
              <span className={strong} aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
