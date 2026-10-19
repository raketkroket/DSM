'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/** Thin reading-progress line under the navigation for long editorial pages. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-steel" style={{ scaleX }} />;
}
