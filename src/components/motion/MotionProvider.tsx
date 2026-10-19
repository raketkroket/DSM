'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/** One place that makes every animation respect the visitor's reduced-motion preference. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
