'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { EASE } from './ease';

/**
 * Architectural image entrance: the frame opens from a clipped inset while the photograph
 * settles from a slight zoom. Optional parallax drifts the image inside its frame on scroll.
 */
export function ImageReveal({
  children,
  className = '',
  parallax = 0,
  from = 'inset(14% 10% 14% 10%)',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  parallax?: number;
  from?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);

  return (
    <motion.div
      ref={ref}
      className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} overflow-hidden ${className}`}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      <motion.div
        className="absolute inset-0"
        style={parallax ? { y, scale: 1 + parallax / 45 } : undefined}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.9, ease: EASE, delay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
