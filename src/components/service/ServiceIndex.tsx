'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ArrowBadge } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import { EASE } from '@/components/motion/ease';
import type { ServiceContent } from '@/lib/content/types';
import { fitTitle } from '@/lib/fit';

/** Editorial index: on desktop a row opens to reveal its photograph; on touch every row shows it. */
export function ServiceIndex({ items }: { items: ServiceContent[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ol className="border-t border-line">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <li key={item.slug} className="border-b border-line">
            <Link
              href={`/diensten/${item.slug}`}
              onMouseEnter={() => setOpen(index)}
              onMouseLeave={() => setOpen(null)}
              onFocus={() => setOpen(index)}
              onBlur={() => setOpen(null)}
              className="group grid grid-cols-1 gap-5 py-8 md:grid-cols-12 md:gap-6 md:py-10"
            >
              <span className="font-mono text-[0.7rem] text-steel md:col-span-1 md:pt-3">{String(index + 1).padStart(2, '0')}</span>
              <div className="md:col-span-6 lg:col-span-5">
                <h2
                  className="fit-title leading-[1.02] font-medium tracking-[-0.04em] text-navy transition-transform duration-700 ease-[var(--ease-arch)] group-hover:translate-x-2 [--fit-w:160vw] md:[--fit-w:min(85vw,1100px)] lg:[--fit-w:min(68vw,940px)]"
                  style={fitTitle(item.title, 3.1)}
                >
                  {item.title}
                </h2>
                <p className="accent mt-3 text-[1.35rem] leading-snug">{item.tagline}</p>
              </div>
              <div className="flex flex-col gap-5 md:col-span-5 lg:col-span-4 lg:col-start-8">
                <p className="text-[1rem] leading-relaxed text-muted">{item.summary}</p>
                <span className="inline-flex items-center gap-3 text-sm font-medium text-navy">
                  Bekijk {item.shortTitle.toLowerCase()} <ArrowBadge variant="text" />
                </span>
              </div>
              {/* Touch: always-visible image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-navy md:hidden">
                <Photo image={item.image} sizes="92vw" />
              </div>
              {/* Desktop: hover reveal */}
              <motion.div
                className="relative hidden overflow-hidden rounded-[3px] bg-navy md:col-span-12 md:block lg:col-span-11 lg:col-start-2"
                initial={false}
                animate={{ height: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                aria-hidden
              >
                <motion.div className="absolute inset-0" animate={{ scale: isOpen ? 1 : 1.12 }} transition={{ duration: 1.2, ease: EASE }}>
                  <Photo image={item.image} sizes="(min-width: 768px) 88vw, 0px" />
                </motion.div>
              </motion.div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
