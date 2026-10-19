'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { EASE } from '@/components/motion/ease';
import { Reveal } from '@/components/motion/Reveal';
import type { HomeContent } from '@/lib/content/types';

/* ── Isometric geometry ─────────────────────────────────────────────── */
const S = 22;
const OX = 318;
const OY = 150;
const C = Math.cos(Math.PI / 6);
const VIEW = { w: 720, h: 560 };

const pt = (x: number, y: number, z = 0) => [OX + (x - y) * C * S, OY + (x + y) * 0.5 * S - z * S] as const;
const P = (x: number, y: number, z = 0) => pt(x, y, z).map((n) => n.toFixed(1)).join(',');
const path = (points: [number, number, number?][], close = true) =>
  `M${points.map(([x, y, z]) => P(x, y, z ?? 0)).join(' L')}${close ? ' Z' : ''}`;
/** Percent position of a scene point, for crisp HTML annotations over the SVG. */
const pct = (x: number, y: number, z = 0) => {
  const [sx, sy] = pt(x, y, z);
  return { left: `${(sx / VIEW.w) * 100}%`, top: `${(sy / VIEW.h) * 100}%` };
};

type Box = { x0: number; x1: number; y0: number; y1: number; z: number };
const faces = ({ x0, x1, y0, y1, z }: Box) => ({
  top: path([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]),
  right: path([[x1, y0, 0], [x1, y1, 0], [x1, y1, z], [x1, y0, z]]),
  front: path([[x0, y1, 0], [x1, y1, 0], [x1, y1, z], [x0, y1, z]]),
});

const building: Box = { x0: 5, x1: 15, y0: 3, y1: 10, z: 7 };
const annex: Box = { x0: 16, x1: 19, y0: 1.5, y1: 5.5, z: 2.6 };
const B = faces(building);
const A = faces(annex);

const LAYER_LINKS = [
  [
    { href: '/diensten/receptiediensten', label: 'Receptiediensten' },
    { href: '/diensten/evenementenbeveiliging', label: 'Evenementenbeveiliging' },
    { href: '/diensten/recreatiebeveiliging', label: 'Recreatiebeveiliging' },
  ],
  [
    { href: '/diensten/objectbewaking', label: 'Objectbewaking' },
    { href: '/diensten/bouwplaatsbeveiliging', label: 'Bouwplaatsbeveiliging' },
    { href: '/diensten/cameratoezicht', label: 'Cameratoezicht' },
  ],
  [
    { href: '/diensten/veiligheidskundigen-en-risicoanalyses', label: 'Risicoanalyses' },
    { href: '/diensten/beveiliging-op-maat', label: 'Beveiliging op maat' },
  ],
];

const ANNOTATIONS = [
  [
    { at: pct(10.8, 10, 1.6), label: 'Ontvangst en registratie', align: 'right' as const },
    { at: pct(14.2, 13.3, 0), label: 'Bezoekersstromen', align: 'right' as const },
    { at: pct(1.2, 12.6, 0), label: 'Medewerkers en bezoekers', align: 'right' as const },
  ],
  [
    { at: pct(0, 9, 0.9), label: 'Perimeter en hekwerk', align: 'right' as const },
    { at: pct(15, 3, 7), label: 'Gebouwschil', align: 'right' as const },
    { at: pct(17.5, 1.5, 2.6), label: 'Bedrijfsmiddelen', align: 'left' as const },
    { at: pct(15, 14, 0.8), label: 'Toegangspoort', align: 'right' as const },
  ],
  [
    { at: pct(10, 6, 10.6), label: 'Afspraken en procedures', align: 'right' as const },
    { at: pct(3.4, 11.6, 0), label: 'Controleronde', align: 'left' as const },
    { at: pct(10, 10.6, 0), label: 'Toegangsbeheer', align: 'right' as const },
  ],
];

const PEOPLE: [number, number][] = [
  [9.2, 11.6],
  [10.9, 11.9],
  [8.1, 12.9],
  [13.1, 13.1],
  [15.2, 14.9],
];

function Person({ x, y, active }: { x: number; y: number; active: boolean }) {
  const [sx, sy] = pt(x, y, 0);
  return (
    <g>
      {active && (
        <ellipse cx={sx} cy={sy} rx="11" ry="5.5" className="layer-pulse fill-none stroke-steel" strokeWidth="1" />
      )}
      <ellipse cx={sx} cy={sy} rx="6" ry="3" className="fill-navy/10" />
      <rect x={sx - 3.6} y={sy - 15} width="7.2" height="13" rx="3.6" className={active ? 'fill-navy' : 'fill-navy/60'} />
      <circle cx={sx} cy={sy - 19} r="3.4" className={active ? 'fill-navy' : 'fill-navy/60'} />
    </g>
  );
}

function Camera({ x, y, z, dir }: { x: number; y: number; z: number; dir: 1 | -1 }) {
  const [sx, sy] = pt(x, y, z);
  return (
    <g>
      <rect x={sx - 5 + dir * 3} y={sy - 3} width="10" height="6" rx="2" className="fill-navy" />
      <circle cx={sx + dir * 9} cy={sy} r="1.6" className="fill-steel" />
    </g>
  );
}

type Note = { at: { left: string; top: string }; label: string; align: 'left' | 'right' };

/** A label pinned to a point in the scene; flips to the other side if it would leave the frame. */
function Annotation({ note, index }: { note: Note; index: number }) {
  const pill = useRef<HTMLSpanElement>(null);
  const [align, setAlign] = useState(note.align);
  useLayoutEffect(() => {
    const element = pill.current;
    const frame = element?.closest('[data-scene]');
    if (!element || !frame) return;
    const box = element.getBoundingClientRect();
    const bounds = frame.getBoundingClientRect();
    if (box.right > bounds.right - 4 && align === 'right') setAlign('left');
    else if (box.left < bounds.left + 4 && align === 'left') setAlign('right');
  }, [align]);
  return (
    <motion.div
      className="pointer-events-none absolute hidden sm:block"
      style={note.at}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.25 + index * 0.08 }}
    >
      <span ref={pill} className={`absolute flex -translate-y-1/2 items-center gap-2 whitespace-nowrap ${align === 'left' ? 'right-0 flex-row-reverse' : 'left-0'}`}>
        <span className="h-2 w-2 shrink-0 rounded-full border border-navy bg-white" />
        <span className="h-px w-6 bg-navy/50" />
        <span className="rounded-full border border-line bg-white/95 px-3 py-1 font-mono text-[0.62rem] tracking-[0.08em] text-navy uppercase shadow-soft">
          {note.label}
        </span>
      </span>
    </motion.div>
  );
}

export function SecurityLayers({ layers }: { layers: HomeContent['layers'] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = layers.items.slice(0, 3);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % items.length,
      ArrowDown: (index + 1) % items.length,
      ArrowLeft: (index - 1 + items.length) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      const next = keys[event.key];
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  const dim = (layer: number) => ({ opacity: active === layer ? 1 : 0.14 });
  const t = { duration: 0.8, ease: EASE };

  // Fence with a gate opening between x = 14 and x = 16 on the front edge.
  const fence: [number, number][] = [
    [14, 14], [0, 14], [0, 0], [20, 0], [20, 14], [16, 14],
  ];
  const posts: [number, number][] = [];
  for (let x = 0; x <= 20; x += 2) {
    posts.push([x, 0]);
    if (x <= 14 || x >= 16) posts.push([x, 14]);
  }
  for (let y = 2; y < 14; y += 2) posts.push([0, y], [20, y]);

  const route: [number, number, number?][] = [[3.4, 1.6], [15.2, 1.6], [15.2, 11.6], [3.4, 11.6]];

  return (
    <section id="lagen" aria-labelledby="lagen-titel" className="relative overflow-hidden bg-white py-24 md:py-36">
      <div className="shell">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow">{layers.eyebrow}</p>
              <h2 id="lagen-titel" className="display-lg mt-6 max-w-[16ch] text-navy">
                {layers.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="text-[1.05rem] leading-relaxed text-muted">{layers.text}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          {/* Controls + detail */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div role="tablist" aria-label="Beveiligingslagen" aria-orientation="vertical" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-0">
              {items.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.title}
                    ref={(element) => {
                      tabs.current[index] = element;
                    }}
                    role="tab"
                    id={`laag-tab-${index}`}
                    aria-selected={selected}
                    aria-controls="laag-paneel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={`group relative flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-colors duration-500 lg:flex-row lg:items-baseline lg:gap-5 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:px-0 lg:py-6 ${
                      selected ? 'border-navy bg-navy text-white lg:bg-transparent lg:text-navy' : 'border-line text-ink/50 hover:text-ink'
                    }`}
                  >
                    <span className={`font-mono text-[0.7rem] ${selected ? 'text-steel-soft lg:text-steel' : 'text-steel'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="max-w-full text-[0.85rem] font-medium tracking-[-0.02em] break-words xs:text-[1rem] sm:text-[1.25rem] lg:text-[2rem] lg:leading-none lg:tracking-[-0.035em]">
                      {item.title}
                    </span>
                    {selected && (
                      <motion.span
                        layoutId="laag-lijn"
                        className="absolute bottom-[-1px] left-0 hidden h-[2px] w-full bg-navy lg:block"
                        transition={t}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div id="laag-paneel" role="tabpanel" aria-labelledby={`laag-tab-${active}`} className="mt-8 min-h-[17rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <p className="lead text-ink">{items[active].summary}</p>
                  <ul className="mt-6 space-y-3">
                    {items[active].points.map((point) => (
                      <li key={point} className="flex gap-3 text-[0.98rem] text-muted">
                        <span className="mt-[0.6rem] h-px w-4 shrink-0 bg-steel" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {LAYER_LINKS[active].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full border border-line px-4 py-2 text-sm text-navy transition-colors hover:border-navy"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Visualization */}
          <div className="order-1 lg:order-2 lg:col-span-8">
            <div className="blueprint relative overflow-hidden rounded-[1.5rem] border border-line bg-paper">
              <div className="absolute top-4 left-5 z-10 flex items-center gap-3 md:top-6 md:left-7" aria-hidden>
                <span className="font-mono text-[0.66rem] tracking-[0.18em] text-steel uppercase">Laag</span>
                <span className="font-mono text-[0.66rem] text-navy">
                  {String(active + 1).padStart(2, '0')} — {items[active]?.title}
                </span>
              </div>
              <div data-scene className="relative mx-auto aspect-[720/560] w-full max-w-[56rem]">
                <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Gestileerde weergave van een bedrijfslocatie met de lagen mensen, eigendommen en processen">
                  {/* Ground plot */}
                  <path d={path([[0, 0], [20, 0], [20, 14], [0, 14]])} className="fill-white stroke-line-strong" strokeWidth="1" />
                  {Array.from({ length: 9 }, (_, i) => (
                    <path key={`gx${i}`} d={path([[i * 2 + 2, 0], [i * 2 + 2, 14]], false)} className="stroke-line" strokeWidth="0.6" />
                  ))}
                  {Array.from({ length: 6 }, (_, i) => (
                    <path key={`gy${i}`} d={path([[0, i * 2 + 2], [20, i * 2 + 2]], false)} className="stroke-line" strokeWidth="0.6" />
                  ))}
                  {/* Access road */}
                  <path d={path([[14, 14], [16, 14], [16, 18], [14, 18]])} className="fill-mist" />

                  {/* PROPERTY — camera fields of view on the ground (beneath the building) */}
                  <motion.g animate={dim(1)} transition={t}>
                    <path d={path([[15, 10], [19.5, 13.5], [17, 13.8]])} className="fill-steel/15" />
                    <path d={path([[5, 10], [1, 13.5], [3.6, 13.8]])} className="fill-steel/15" />
                  </motion.g>

                  {/* PROCESSES — patrol route on the ground */}
                  <motion.g animate={dim(2)} transition={t}>
                    <path d={path(route)} className={`fill-none stroke-navy ${active === 2 ? 'layer-dash' : ''}`} strokeWidth="1.6" strokeDasharray="6 6" />
                    {route.map(([x, y], i) => {
                      const [sx, sy] = pt(x, y, 0);
                      return (
                        <g key={i}>
                          <path d={`M${sx} ${sy - 7} L${sx + 9} ${sy} L${sx} ${sy + 7} L${sx - 9} ${sy} Z`} className="fill-white stroke-navy" strokeWidth="1.2" />
                          <text x={sx} y={sy + 3} textAnchor="middle" className="fill-navy font-mono text-[8px]">
                            {i + 1}
                          </text>
                        </g>
                      );
                    })}
                  </motion.g>

                  {/* PEOPLE — visitor flow behind the people */}
                  <motion.g animate={dim(0)} transition={t}>
                    <path
                      d={`M${P(15, 16.5)} C${P(15, 14)} ${P(13.5, 12.4)} ${P(11.5, 11.4)} S${P(10, 10.6)} ${P(10, 10.2)}`}
                      className={`fill-none stroke-steel ${active === 0 ? 'layer-dash' : ''}`}
                      strokeWidth="1.6"
                      strokeDasharray="2 5"
                      strokeLinecap="round"
                    />
                  </motion.g>

                  {/* Annex (assets) */}
                  <g>
                    <path d={A.right} className="fill-mist stroke-navy/40" strokeWidth="1" />
                    <path d={A.front} className="fill-paper stroke-navy/40" strokeWidth="1" />
                    <path d={A.top} className="fill-white stroke-navy/40" strokeWidth="1" />
                    {[17, 18].map((x) => (
                      <path key={x} d={path([[x, 5.5, 0.2], [x, 5.5, 2.2]], false)} className="stroke-navy/25" strokeWidth="1" />
                    ))}
                  </g>

                  {/* Building */}
                  <g>
                    <path d={B.right} className="fill-mist stroke-navy/45" strokeWidth="1" />
                    <path d={B.front} className="fill-paper stroke-navy/45" strokeWidth="1" />
                    {/* floors */}
                    {[2.4, 4.8].map((z) => (
                      <g key={z}>
                        <path d={path([[5, 10, z], [15, 10, z], [15, 3, z]], false)} className="fill-none stroke-navy/30" strokeWidth="1" />
                      </g>
                    ))}
                    {/* mullions */}
                    {[6.25, 7.5, 8.75, 11.25, 12.5, 13.75].map((x) => (
                      <path key={`m${x}`} d={path([[x, 10, 0.1], [x, 10, 6.9]], false)} className="stroke-navy/15" strokeWidth="1" />
                    ))}
                    {[4.4, 5.8, 7.2, 8.6].map((y) => (
                      <path key={`r${y}`} d={path([[15, y, 0.1], [15, y, 6.9]], false)} className="stroke-navy/15" strokeWidth="1" />
                    ))}
                    {/* entrance */}
                    <path d={path([[9.2, 10, 0], [10.8, 10, 0], [10.8, 10, 1.9], [9.2, 10, 1.9]])} className="fill-navy/80" />
                    <path d={B.top} className="fill-white stroke-navy/45" strokeWidth="1" />
                    <path d={path([[6, 4, 7], [14, 4, 7], [14, 9, 7], [6, 9, 7]])} className="fill-none stroke-navy/15" strokeWidth="1" />
                  </g>

                  {/* PROPERTY — envelope, fence, gate, cameras */}
                  <motion.g animate={dim(1)} transition={t}>
                    <path
                      d={path([[5, 10, 0], [5, 10, 7], [5, 3, 7], [15, 3, 7], [15, 3, 0], [15, 10, 0], [5, 10, 0]], false)}
                      className="fill-none stroke-navy"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path d={path([[15, 10, 0], [15, 10, 7]], false)} className="stroke-navy" strokeWidth="1.8" />
                    <path d={path([[5, 10, 7], [15, 10, 7], [15, 3, 7]], false)} className="fill-none stroke-navy" strokeWidth="1.8" />
                    <path d={path([[16, 5.5, 0], [16, 5.5, 2.6], [19, 5.5, 2.6], [19, 5.5, 0]], false)} className="fill-none stroke-navy" strokeWidth="1.4" />
                    <path d={path(fence.map(([x, y]) => [x, y, 0.9]), false)} className="fill-none stroke-navy" strokeWidth="1.3" />
                    {posts.map(([x, y], i) => (
                      <path key={i} d={path([[x, y, 0], [x, y, 0.9]], false)} className="stroke-navy" strokeWidth="1.1" />
                    ))}
                    <path d={path([[14, 14, 0], [14, 14, 1.4]], false)} className="stroke-navy" strokeWidth="2.2" />
                    <path d={path([[16, 14, 0], [16, 14, 1.4]], false)} className="stroke-navy" strokeWidth="2.2" />
                    <path d={path([[14, 14, 1.15], [15.4, 14, 1.15]], false)} className="stroke-steel" strokeWidth="2" />
                    <Camera x={15} y={10} z={6.4} dir={1} />
                    <Camera x={5} y={10} z={6.4} dir={-1} />
                  </motion.g>

                  {/* PEOPLE */}
                  <motion.g animate={dim(0)} transition={t}>
                    {PEOPLE.map(([x, y], i) => (
                      <Person key={i} x={x} y={y} active={active === 0} />
                    ))}
                  </motion.g>

                  {/* PROCESSES — access point and floating plan */}
                  <motion.g animate={dim(2)} transition={t}>
                    {(() => {
                      const [sx, sy] = pt(10, 10.6, 0);
                      return (
                        <g>
                          <ellipse cx={sx} cy={sy} rx="20" ry="10" className="fill-none stroke-navy" strokeWidth="1.4" />
                          <ellipse cx={sx} cy={sy} rx="12" ry="6" className="fill-steel/20" />
                        </g>
                      );
                    })()}
                    {[
                      [7, 4],
                      [13, 4],
                      [13, 8],
                      [7, 8],
                    ].map(([x, y]) => (
                      <path key={`${x}${y}`} d={path([[x, y, 7], [x, y, 10.2]], false)} className="stroke-navy/50" strokeWidth="1" strokeDasharray="2 4" />
                    ))}
                    <g className={active === 2 ? 'layer-float' : ''}>
                      <path d={path([[7, 4, 10.6], [13, 4, 10.6], [13, 8, 10.6], [7, 8, 10.6]])} className="fill-white stroke-navy" strokeWidth="1.4" />
                      {[4.9, 5.7, 6.5, 7.3].map((y, i) => (
                        <path key={y} d={path([[7.8, y, 10.6], [i === 3 ? 10 : 12.2, y, 10.6]], false)} className="stroke-navy/40" strokeWidth="1.2" />
                      ))}
                      <path d={path([[7.8, 4.4, 10.6], [9.4, 4.4, 10.6]], false)} className="stroke-steel" strokeWidth="2" />
                    </g>
                  </motion.g>
                </svg>

                {/* Annotations */}
                <AnimatePresence>
                  {ANNOTATIONS[active].map((note, index) => (
                    <Annotation key={`${active}-${note.label}`} note={note} index={index} />
                  ))}
                </AnimatePresence>
              </div>
              <p className="border-t border-line px-5 py-3 font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase md:px-7">
                Illustratief schema — geen weergave van een bestaande locatie
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
