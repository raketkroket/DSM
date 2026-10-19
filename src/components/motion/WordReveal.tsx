'use client';

import { motion } from 'motion/react';
import { EASE } from './ease';

type Part = { text: string; accent?: boolean };

/**
 * Headline reveal: each word rises out of its own mask. Accent parts are set in the
 * editorial serif. Rendered as real text, so it stays readable for search and assistive tech.
 */
export function WordReveal({
  parts,
  className,
  as = 'h2',
  delay = 0,
  stagger = 0.045,
  id,
}: {
  id?: string;
  parts: Part[];
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  stagger?: number;
}) {
  const Tag = motion[as];
  let index = 0;
  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {parts.map((part, partIndex) => (
        <span key={partIndex} className={part.accent ? 'accent' : undefined}>
          {part.text
            .split(' ')
            .filter(Boolean)
            .map((word, wordIndex, words) => {
              const i = index++;
              return (
                <span key={wordIndex} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                  <motion.span
                    className="inline-block will-change-transform"
                    variants={{
                      hidden: { y: '108%' },
                      shown: { y: '0%', transition: { duration: 1, ease: EASE, delay: delay + i * stagger } },
                    }}
                  >
                    {word}
                  </motion.span>
                  {wordIndex < words.length - 1 || partIndex < parts.length - 1 ? ' ' : null}
                </span>
              );
            })}
        </span>
      ))}
    </Tag>
  );
}
