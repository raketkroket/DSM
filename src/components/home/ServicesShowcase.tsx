import Link from 'next/link';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ArrowBadge, ButtonLink } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { HomeContent, ServiceContent } from '@/lib/content/types';

type Item = Pick<ServiceContent, 'slug' | 'title' | 'tagline' | 'image'>;

/* Desktop composition: a tall feature, a mirrored tall feature and quieter tiles between them. */
const LAYOUT = [
  'lg:col-span-7 lg:row-span-2',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-5',
  'lg:col-span-7 lg:row-span-2',
  'lg:col-span-5',
];

function Tile({ item, index, tall }: { item: Item; index: number; tall: boolean }) {
  return (
    <Link href={`/diensten/${item.slug}`} className="group relative block h-full min-h-[20rem] overflow-hidden bg-navy-deep text-white md:min-h-[22rem]">
      <Photo
        image={item.image}
        sizes={tall ? '(min-width: 1024px) 58vw, (min-width: 768px) 46vw, 92vw' : '(min-width: 1024px) 40vw, (min-width: 768px) 46vw, 92vw'}
        className="transition-transform duration-[1.6s] ease-[var(--ease-arch)] group-hover:scale-[1.04]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/15 to-navy-deep/5 transition-colors duration-700 group-hover:from-navy-deep/90" aria-hidden />
      <span className="absolute top-6 left-6 text-[0.78rem] font-medium tracking-[0.12em] text-white/70 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      <span
        className="absolute top-5 right-5 grid h-10 w-10 place-items-center border border-white/35 text-white opacity-0 transition-[opacity,background-color,color] duration-500 group-hover:opacity-100 group-hover:bg-white group-hover:text-navy group-focus-visible:opacity-100"
        aria-hidden
      >
        <ArrowBadge />
      </span>
      <span className="absolute inset-x-0 bottom-0 block p-6 md:p-8">
        <span className={`block font-display font-medium tracking-[-0.03em] ${tall ? 'text-[clamp(1.9rem,3vw,3rem)] leading-[1.02]' : 'text-[1.55rem] leading-tight'}`}>
          {item.title}
        </span>
        <span
          className={`mt-2 block max-w-[28rem] text-[0.95rem] leading-relaxed text-white/75 transition-[opacity,transform] duration-700 ease-[var(--ease-arch)] ${
            tall ? '' : 'lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100'
          }`}
        >
          {item.tagline}
        </span>
      </span>
    </Link>
  );
}

export function ServicesShowcase({ intro, items }: { intro: HomeContent['servicesIntro']; items: Item[] }) {
  const [first, ...rest] = items;
  return (
    <section aria-labelledby="diensten-titel" className="bg-paper py-24 md:py-36">
      <div className="shell">
        <div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">{intro.eyebrow}</p>
            <h2 id="diensten-titel" className="display-lg mt-6 max-w-[14ch] text-navy">
              {intro.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-[1.05rem] leading-relaxed text-muted">{intro.text}</p>
            <div className="mt-7">
              <ButtonLink href="/diensten" variant="secondary">
                Alle diensten
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Tablet and desktop: photographic tiles */}
        <RevealGroup className="hidden auto-rows-[minmax(22rem,auto)] gap-3 md:grid md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[21rem]" stagger={0.06}>
          {items.map((item, index) => (
            <RevealItem key={item.slug} className={`${LAYOUT[index] ?? 'lg:col-span-4'} ${index === 0 ? 'md:col-span-2 lg:col-span-7' : ''}`}>
              <Tile item={item} index={index} tall={LAYOUT[index]?.includes('row-span-2') ?? false} />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Phones: one feature, then a precise index */}
        <div className="md:hidden">
          {first && (
            <Reveal className="h-[26rem]">
              <Tile item={first} index={0} tall />
            </Reveal>
          )}
          <ol className="mt-4">
            {rest.map((item, index) => (
              <li key={item.slug} className="border-b border-line">
                <Link href={`/diensten/${item.slug}`} className="group flex items-center gap-4 py-4">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden bg-mist">
                    <Photo image={item.image} sizes="64px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.7rem] font-medium tracking-[0.12em] text-muted tabular-nums">{String(index + 2).padStart(2, '0')}</span>
                    <span className="mt-0.5 block font-display text-[1.15rem] font-medium tracking-[-0.02em] text-navy">{item.title}</span>
                  </span>
                  <span className="text-navy">
                    <ArrowBadge />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
