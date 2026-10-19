'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Photo } from '@/components/site/Photo';
import { Reveal } from '@/components/motion/Reveal';
import { EASE } from '@/components/motion/ease';
import type { HomeContent } from '@/lib/content/types';

/** Desktop: a row of architectural panels that open on hover, focus or click. Mobile: stacked cards. */
export function Sectors({ sectors }: { sectors: HomeContent['sectors'] }) {
  const [open, setOpen] = useState(0);

  return (
    <section aria-labelledby="sectoren-titel" className="relative py-24 md:py-36">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow">{sectors.eyebrow}</p>
            <h2 id="sectoren-titel" className="display-md mt-6 max-w-[16ch] text-navy">
              {sectors.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-[1.05rem] leading-relaxed text-muted">{sectors.text}</p>
          </Reveal>
        </div>

        {/* Desktop panels */}
        <Reveal className="mt-16 hidden h-[34rem] gap-3 lg:flex">
          {sectors.items.map((sector, index) => {
            const isOpen = open === index;
            return (
              <motion.button
                key={sector.title}
                type="button"
                aria-expanded={isOpen}
                onMouseEnter={() => setOpen(index)}
                onFocus={() => setOpen(index)}
                onClick={() => setOpen(index)}
                animate={{ flexGrow: isOpen ? 4.2 : 1 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="group relative min-w-0 basis-0 overflow-hidden rounded-[1.25rem] bg-navy text-left text-white"
              >
                <Photo image={sector.image} sizes="(min-width: 1024px) 50vw, 0px" className={`transition-transform duration-[1.4s] ease-[var(--ease-arch)] ${isOpen ? 'scale-100' : 'scale-110'}`} />
                <span
                  className={`absolute inset-0 transition-colors duration-700 ${isOpen ? 'bg-gradient-to-t from-navy-deep/90 via-navy-deep/25 to-transparent' : 'bg-navy-deep/70'}`}
                  aria-hidden
                />
                <span className="absolute top-6 left-6 font-mono text-[0.7rem] text-white/70">{String(index + 1).padStart(2, '0')}</span>
                {/* Collapsed vertical label */}
                <span
                  className={`absolute bottom-7 left-1/2 origin-center -translate-x-1/2 text-[1.05rem] font-medium tracking-[-0.01em] whitespace-nowrap transition-opacity duration-500 [writing-mode:vertical-rl] rotate-180 ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {sector.title}
                </span>
                {/* Expanded content */}
                <span
                  className={`absolute inset-x-0 bottom-0 block p-8 transition-[opacity,transform] duration-700 ease-[var(--ease-arch)] ${
                    isOpen ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span className="block text-[2rem] leading-tight font-medium tracking-[-0.035em]">{sector.title}</span>
                  <span className="mt-3 block max-w-[28rem] text-[1rem] leading-relaxed text-white/80">{sector.text}</span>
                </span>
              </motion.button>
            );
          })}
        </Reveal>

        {/* Mobile list */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:hidden">
          {sectors.items.map((sector, index) => (
            <Reveal as="li" key={sector.title} className="overflow-hidden rounded-[1.25rem] bg-white shadow-soft">
              <div className="relative aspect-[16/10] bg-navy">
                <Photo image={sector.image} sizes="(min-width: 640px) 46vw, 92vw" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[0.66rem] text-navy">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[1.25rem] font-medium tracking-[-0.025em] text-navy">{sector.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{sector.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
