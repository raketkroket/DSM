'use client';

import { motion } from 'motion/react';
import { EASE } from './ease';

/** A hairline that draws itself across the layout, like a construction line. */
export function DrawLine({ className = '', tone = 'line', vertical = false }: { className?: string; tone?: 'line' | 'light'; vertical?: boolean }) {
  return (
    <motion.span
      aria-hidden
      className={`block ${vertical ? 'w-px origin-top' : 'h-px origin-left'} ${tone === 'light' ? 'bg-white/15' : 'bg-line-strong'} ${className}`}
      initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
      whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.6, ease: EASE }}
    />
  );
}
