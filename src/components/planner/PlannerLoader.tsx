'use client';

import dynamic from 'next/dynamic';

/** The planner is a purely interactive tool; render it in the browser with a same-size placeholder. */
export const PlannerLoader = dynamic(() => import('./Planner').then((module) => module.Planner), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6" aria-label="Planner laden" role="status">
      <div className="h-[36rem] animate-pulse rounded-[3px] bg-mist/70 lg:col-span-7" />
      <div className="h-[36rem] animate-pulse rounded-[3px] bg-navy/15 lg:col-span-5" />
    </div>
  ),
});
