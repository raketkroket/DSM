'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE } from './ease';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'section' | 'article' | 'p' | 'span';
};

/** Fades content up once it enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 26, as = 'div' }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

/** Staggers direct children that use <RevealItem>. */
export function RevealGroup({ children, className, stagger = 0.08, as = 'div' }: { children: ReactNode; className?: string; stagger?: number; as?: 'div' | 'ul' | 'ol' | 'dl' }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={{ hidden: { opacity: 0, y: 22 }, shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } }}
    >
      {children}
    </Component>
  );
}
