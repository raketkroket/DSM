'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

/** A statement whose words light up one by one as the reader scrolls through it. */
export function ScrollStatement({ text, className = '', id, as = 'h2' }: { text: string; className?: string; id?: string; as?: 'h2' | 'p' }) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);
  const Tag = as;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = text.split(' ');
  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((word, index) => (
        <Word key={index} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </Tag>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.55, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  );
}
