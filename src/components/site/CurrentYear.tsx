'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** Read on the client only, so the prerendered shell stays static and the year never goes stale. */
export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, () => String(new Date().getFullYear()), () => '');
  return <span>{year}</span>;
}
