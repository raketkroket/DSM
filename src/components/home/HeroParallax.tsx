'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import type { ReactNode } from 'react';

/** Drifts the hero photograph slower than the page for depth. */
export function HeroParallax({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], ['0%', '14%']);
  const scale = useTransform(scrollY, [0, 900], [1.02, 1.1]);
  return (
    <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale }}>
      {children}
    </motion.div>
  );
}
