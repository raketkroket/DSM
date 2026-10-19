import type { CSSProperties } from 'react';

/** Style for `.fit-title`: the longest word decides the size, so compounds never overflow. */
export function fitTitle(text: string, maxRem = 7): CSSProperties {
  const longest = Math.max(10, ...text.split(/\s+/).map((word) => word.length));
  return { '--chars': longest, '--fit-max': `${maxRem}rem` } as CSSProperties;
}
