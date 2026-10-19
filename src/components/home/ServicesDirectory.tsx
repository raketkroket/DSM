'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowBadge } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import { EASE } from '@/components/motion/ease';
import type { ServiceContent } from '@/lib/content/types';

type Item = Pick<ServiceContent, 'slug' | 'title' | 'tagline' | 'summary' | 'image'>;

/**
 * Desktop: an index on the left drives a large photographic frame on the right.
 * Touch: a horizontal, snap-scrolling sequence of cards — no hover required.
 */
export function ServicesDirectory({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];
  const track = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const onTrackScroll = () => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    if (!card) return;
    setSlide(Math.round(element.scrollLeft / (card.offsetWidth + 16)));
  };

  return (
    <>
      {/* Desktop directory */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-12">
        <ol className="lg:col-span-5" aria-label="Diensten">
          {items.map((item, index) => {
            const selected = index === active;
            return (
              <li key={item.slug} className="border-b border-line first:border-t">
                <Link
                  href={`/diensten/${item.slug}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  aria-describedby={selected ? 'dienst-voorbeeld' : undefined}
                  className="group relative flex items-center gap-6 py-[1.05rem]"
                >
                  <span className={`font-mono text-[0.7rem] transition-colors duration-500 ${selected ? 'text-navy' : 'text-steel'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[clamp(1.35rem,1.9vw,1.85rem)] leading-tight tracking-[-0.03em] transition-[color,transform] duration-700 ease-[var(--ease-arch)] ${
                      selected ? 'translate-x-2 text-navy' : 'text-ink/40 group-hover:text-ink/70'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`ml-auto transition-[opacity,transform] duration-500 ease-[var(--ease-arch)] ${
                      selected ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                    }`}
                  >
                    <ArrowBadge variant="text" />
                  </span>
                  {selected && (
                    <motion.span
                      layoutId="dienst-indicator"
                      className="absolute bottom-[-1px] left-0 h-px w-full bg-navy"
                      transition={{ duration: 0.7, ease: EASE }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="sticky top-28">
            <div className="relative aspect-[5/6] max-h-[78vh] w-full overflow-hidden rounded-[1.5rem] bg-navy">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={{ clipPath: 'inset(0% 0% 100% 0%)', scale: 1.08 }}
                  animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 1.05, ease: EASE }}
                >
                  <Photo image={current.image} sizes="(min-width: 1024px) 46vw, 0px" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/10 to-transparent" aria-hidden />
              <div id="dienst-voorbeeld" className="absolute inset-x-0 bottom-0 p-8 text-white">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <p className="mono-label text-white/60">
                      {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                    </p>
                    <p className="accent mt-3 text-[2rem] leading-tight">{current.tagline}</p>
                    <p className="mt-3 max-w-[30rem] text-[0.98rem] leading-relaxed text-white/75">{current.summary}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Touch / small screens */}
      <div className="lg:hidden">
        <div
          ref={track}
          onScroll={onTrackScroll}
          className="no-scrollbar -mx-[clamp(1rem,4vw,3.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[clamp(1rem,4vw,3.5rem)] px-[clamp(1rem,4vw,3.5rem)] pb-2"
        >
          {items.map((item, index) => (
            <Link
              key={item.slug}
              href={`/diensten/${item.slug}`}
              className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-soft sm:w-[46%]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                <Photo image={item.image} sizes="(min-width: 640px) 46vw, 82vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 to-transparent" aria-hidden />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[0.66rem] text-navy">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="accent absolute right-5 bottom-4 left-5 text-[1.45rem] leading-tight text-white">{item.tagline}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-[1.3rem] font-medium tracking-[-0.025em] text-navy">{item.title}</h3>
                <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-muted">{item.summary}</p>
                <span className="mt-auto inline-flex items-center gap-3 pt-2 text-sm font-medium text-navy">
                  Bekijk dienst <ArrowBadge variant="text" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4" aria-hidden>
          <span className="font-mono text-[0.7rem] text-navy">{String(Math.min(slide + 1, items.length)).padStart(2, '0')}</span>
          <span className="relative h-px flex-1 bg-line">
            <span
              className="absolute inset-y-0 left-0 bg-navy transition-[width] duration-500 ease-[var(--ease-arch)]"
              style={{ width: `${((Math.min(slide, items.length - 1) + 1) / items.length) * 100}%` }}
            />
          </span>
          <span className="font-mono text-[0.7rem] text-muted">{String(items.length).padStart(2, '0')}</span>
        </div>
      </div>
    </>
  );
}
