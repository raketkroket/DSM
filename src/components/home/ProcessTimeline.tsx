'use client';

import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '@/components/motion/ease';
import { Reveal } from '@/components/motion/Reveal';
import type { HomeContent } from '@/lib/content/types';

function Step({
  index,
  step,
  total,
  onActive,
  active,
}: {
  index: number;
  step: { title: string; text: string };
  total: number;
  onActive: (index: number) => void;
  active: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li ref={ref} className="relative pl-10 lg:pl-14">
      {/* Node on the rail */}
      <span
        aria-hidden
        className={`absolute top-2 left-0 grid h-[1.4rem] w-[1.4rem] -translate-x-1/2 place-items-center rounded-full border bg-paper transition-colors duration-700 lg:top-3 ${
          active ? 'border-navy' : 'border-line-strong'
        }`}
      >
        <span className={`h-2 w-2 rounded-full transition-all duration-700 ${active ? 'scale-100 bg-navy' : 'scale-50 bg-line-strong'}`} />
      </span>
      <div className={`pb-16 transition-opacity duration-700 lg:min-h-[44vh] lg:pb-24 ${active ? 'opacity-100' : 'lg:opacity-35'}`}>
        <p className="mono-label text-steel">
          Stap {String(index + 1).padStart(2, '0')} <span className="text-muted">/ {String(total).padStart(2, '0')}</span>
        </p>
        <h3 className="display-sm mt-4 max-w-[22ch] text-navy">{step.title}</h3>
        <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted">{step.text}</p>
      </div>
    </li>
  );
}

export function ProcessTimeline({ process }: { process: HomeContent['process'] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 55%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section aria-labelledby="werkwijze-titel" className="relative bg-paper py-24 md:py-36">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow">{process.eyebrow}</p>
              <h2 id="werkwijze-titel" className="display-md mt-6 max-w-[16ch] text-navy">
                {process.title}
              </h2>
              <p className="mt-6 max-w-[30rem] text-[1.05rem] leading-relaxed text-muted">{process.text}</p>
            </Reveal>

            <div className="mt-14 hidden items-end gap-6 lg:flex" aria-hidden>
              <div className="relative h-[8.5rem] w-[7.5rem] overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={active}
                    className="absolute bottom-0 left-0 block text-[8.5rem] leading-[0.8] font-medium tracking-[-0.06em] text-navy"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.8, ease: EASE }}
                  >
                    {String(active + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="pb-2">
                <p className="mono-label text-steel">Huidige stap</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={active}
                    className="mt-2 max-w-[16rem] text-[1.05rem] leading-snug text-ink"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {process.steps[active]?.title}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-10 hidden gap-1.5 lg:flex" aria-hidden>
              {process.steps.map((_, index) => (
                <span key={index} className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full origin-left bg-navy transition-transform duration-700 ease-[var(--ease-arch)]"
                    style={{ transform: `scaleX(${index <= active ? 1 : 0})` }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          {/* Rail */}
          <span className="absolute top-3 bottom-16 left-0 w-px bg-line" aria-hidden />
          <motion.span
            className="absolute top-3 bottom-16 left-0 w-px origin-top bg-navy"
            style={{ scaleY: progress }}
            aria-hidden
          />
          <ol ref={list}>
            {process.steps.map((step, index) => (
              <Step key={step.title} index={index} step={step} total={process.steps.length} onActive={setActive} active={index === active} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
