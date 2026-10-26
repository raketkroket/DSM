'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Photo } from '@/components/site/Photo';
import { ScrollStatement } from '@/components/motion/ScrollStatement';
import type { ImageRef } from '@/lib/content/types';

/** Full-bleed photographic pause between light sections: one statement, lit word by word. */
export function StatementBand({ eyebrow, statement, image }: { eyebrow: string; statement: string; image: ImageRef }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <section ref={ref} aria-label={eyebrow} className="relative isolate overflow-hidden bg-navy-deep text-white">
      <motion.div className="absolute inset-0 -z-10 scale-[1.18]" style={{ y }}>
        <Photo image={image} sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-navy-deep/70" aria-hidden />
      <div className="shell flex min-h-[80svh] flex-col justify-center py-28 md:min-h-[92svh]">
        <p className="mono-label text-white/60">{eyebrow}</p>
        <ScrollStatement
          text={statement}
          className="mt-8 max-w-[20ch] font-display text-[clamp(2.4rem,6.2vw,6.4rem)] leading-[0.98] font-medium tracking-[-0.04em]"
        />
      </div>
    </section>
  );
}
