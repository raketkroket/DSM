'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Check,
  HardHat,
  RotateCcw,
  Shapes,
  Store,
  Ticket,
  Trees,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EASE } from '@/components/motion/ease';
import { ArrowBadge, buttonClass } from '@/components/site/Button';
import { Photo } from '@/components/site/Photo';
import type { ImageRef } from '@/lib/content/types';
import {
  CONCERNS,
  LOCATIONS,
  PERIODS,
  PLANNER_STORAGE_KEY,
  SCHEDULE_PRESETS,
  describeSchedule,
  emptySchedule,
  layerFocus,
  plannerSummary,
  recommend,
  scheduleStats,
  type ConcernId,
  type LocationId,
  type PlannerInput,
} from '@/lib/planner';
import { WeekGrid } from './WeekGrid';

type ServiceInfo = { slug: string; title: string; tagline: string; image: ImageRef };

const ICONS: Record<LocationId, LucideIcon> = {
  kantoor: Building2,
  bouwplaats: HardHat,
  evenement: Ticket,
  winkel: Store,
  recreatie: Trees,
  opslag: Warehouse,
  anders: Shapes,
};

const STEPS = ['Locatie', 'Aandachtspunten', 'Momenten', 'Profiel'];
const SAVE_KEY = 'dsm-planner-voortgang';

const initial = (): PlannerInput => ({ location: null, concerns: [], schedule: emptySchedule(), period: null });

/** Restores a half-finished plan; storage can be unavailable (private mode), so never rely on it. */
function restore(): { input: PlannerInput; step: number } | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { input: PlannerInput; step: number };
    if (!saved?.input?.schedule || saved.input.schedule.length !== 4) return null;
    return saved;
  } catch {
    return null;
  }
}

export function Planner({ services }: { services: ServiceInfo[] }) {
  const router = useRouter();
  // Rendered client-only (see PlannerLoader), so saved progress can seed the initial state.
  const [saved] = useState(restore);
  const [input, setInput] = useState<PlannerInput>(() => saved?.input ?? initial());
  const [step, setStep] = useState(() => Math.min(saved?.step ?? 0, 3));
  const [direction, setDirection] = useState(1);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({ input, step }));
    } catch {
      // Storage unavailable: the planner still works, it just won't remember.
    }
  }, [input, step]);

  const byslug = useMemo(() => Object.fromEntries(services.map((service) => [service.slug, service])), [services]);
  // Only suggest services that are currently published.
  const recommendations = useMemo(() => recommend(input).filter((item) => byslug[item.slug]), [input, byslug]);
  const focus = useMemo(() => layerFocus(input.concerns), [input.concerns]);
  const stats = scheduleStats(input.schedule);
  const scheduleText = describeSchedule(input.schedule);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    const top = document.getElementById('planner')?.getBoundingClientRect().top ?? 0;
    if (top < 0) document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseLocation = (location: LocationId) => {
    setInput((current) => ({ ...current, location }));
    setTimeout(() => goTo(1), 280);
  };

  const toggleConcern = (concern: ConcernId) =>
    setInput((current) => ({
      ...current,
      concerns: current.concerns.includes(concern) ? current.concerns.filter((id) => id !== concern) : [...current.concerns, concern],
    }));

  const reset = () => {
    setInput(initial());
    goTo(0);
  };

  const toQuote = () => {
    const top = recommendations[0];
    const titles = Object.fromEntries(services.map((service) => [service.slug, service.title]));
    try {
      window.sessionStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify({ message: plannerSummary(input, titles) }));
    } catch {
      // Without storage the quote form simply starts empty.
    }
    router.push(`/offerte?planner=1${top ? `&dienst=${top.slug}` : ''}`);
  };

  const canNext = step === 0 ? Boolean(input.location) : step === 1 ? input.concerns.length > 0 : step === 2 ? stats.total > 0 : true;
  const locationLabel = LOCATIONS.find((item) => item.id === input.location)?.label;

  /* ── Live profile (right column on desktop, after the steps on mobile) ── */
  const profile = (
    <div className="relative overflow-hidden rounded-[3px] bg-navy-deep p-6 text-white sm:p-8">
      <div className="blueprint-dark pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="mono-label text-steel-soft">Uw beveiligingsprofiel</p>
          <span className="font-mono text-[0.66rem] text-white/65">{String(Math.min(step + 1, 4)).padStart(2, '0')} / 04</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={locationLabel ?? 'leeg'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-4 text-[1.6rem] leading-tight font-medium tracking-[-0.03em]"
          >
            {locationLabel ?? <span className="text-white/60">Kies een locatie</span>}
          </motion.p>
        </AnimatePresence>

        <div className="mt-7">
          <p className="mono-label text-white/60">Momenten</p>
          <div className="mt-3">
            <WeekGrid value={input.schedule} readOnly tone="dark" />
          </div>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-white/65">{scheduleText}</p>
        </div>

        <div className="mt-7">
          <p className="mono-label text-white/60">Aandachtsverdeling</p>
          <ul className="mt-3 space-y-2.5">
            {(['mensen', 'eigendommen', 'processen'] as const).map((layer) => (
              <li key={layer} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-[0.82rem]">
                <span className="text-white/75 capitalize">{layer}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full rounded-full bg-steel-soft"
                    initial={false}
                    animate={{ width: `${Math.round(focus[layer] * 100)}%` }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7">
          <p className="mono-label text-white/60">Passende diensten</p>
          {recommendations.length === 0 ? (
            <p className="mt-3 text-[0.88rem] text-white/65">Verschijnen zodra u keuzes maakt.</p>
          ) : (
            <motion.ol layout className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {recommendations.map((item, index) => (
                  <motion.li
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex items-center gap-3 rounded-[2px] bg-white/[0.06] px-3 py-2.5"
                  >
                    <span className="font-mono text-[0.66rem] text-steel-soft">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-[0.92rem]">{byslug[item.slug]?.title ?? item.slug}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ol>
          )}
        </div>
        <p className="mt-7 border-t border-white/10 pt-4 text-[0.75rem] leading-relaxed text-white/60">
          Geen automatische prijs: iedere situatie wordt eerst samen met u besproken.
        </p>
      </div>
    </div>
  );

  return (
    <div id="planner" className="grid grid-cols-1 gap-8 scroll-mt-28 lg:grid-cols-12 lg:gap-6">
      <div className="min-w-0 lg:col-span-7">
        {/* Step indicator */}
        <ol className="grid grid-cols-4 gap-2" aria-label="Stappen">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => index < step && goTo(index)}
                disabled={index > step}
                aria-current={index === step ? 'step' : undefined}
                aria-label={`${String(index + 1).padStart(2, '0')} ${label}`}
                className="w-full text-left disabled:cursor-default"
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full origin-left bg-navy transition-transform duration-700 ease-[var(--ease-arch)]"
                    style={{ transform: `scaleX(${index <= step ? 1 : 0})` }}
                  />
                </span>
                <span className={`mt-3 block font-mono text-[0.64rem] tracking-[0.14em] uppercase ${index === step ? 'text-navy' : 'text-muted'}`}>
                  {String(index + 1).padStart(2, '0')} <span className="hidden sm:inline">{label}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="relative mt-10 min-h-[28rem]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {step === 0 && (
                <>
                  <h2 ref={heading} tabIndex={-1} className="display-sm text-navy outline-none">
                    Wat wilt u beveiligen?
                  </h2>
                  <div role="radiogroup" aria-label="Type locatie" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {LOCATIONS.map((location) => {
                      const Icon = ICONS[location.id];
                      const selected = input.location === location.id;
                      return (
                        <button
                          key={location.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => chooseLocation(location.id)}
                          className={`group relative flex min-h-[9.5rem] flex-col items-start justify-between rounded-[3px] border p-4 text-left transition-[border-color,background-color,transform,box-shadow] duration-500 ease-[var(--ease-arch)] hover:-translate-y-0.5 sm:p-5 ${
                            selected ? 'border-navy bg-navy text-white shadow-panel' : 'border-line bg-white text-ink hover:border-navy/40 hover:shadow-soft'
                          }`}
                        >
                          <span className={`grid h-11 w-11 place-items-center rounded-[2px] transition-colors ${selected ? 'bg-white/10 text-white' : 'bg-mist text-navy group-hover:bg-steel-wash'}`}>
                            <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                          </span>
                          <span>
                            <span className="block text-[0.98rem] leading-snug font-medium tracking-[-0.01em]">{location.label}</span>
                            <span className={`mt-1 block text-[0.78rem] leading-snug ${selected ? 'text-white/65' : 'text-muted'}`}>{location.hint}</span>
                          </span>
                          {selected && (
                            <span className="absolute top-4 right-4 grid h-6 w-6 place-items-center rounded-full bg-white text-navy">
                              <Check className="h-3.5 w-3.5" aria-hidden />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 ref={heading} tabIndex={-1} className="display-sm text-navy outline-none">
                    Waar maakt u zich zorgen over?
                  </h2>
                  <p className="mt-3 text-[1rem] text-muted">Kies alles wat van toepassing is.</p>
                  <div className="mt-8 flex flex-wrap gap-2.5">
                    {CONCERNS.map((concern) => {
                      const selected = input.concerns.includes(concern.id);
                      return (
                        <button
                          key={concern.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleConcern(concern.id)}
                          className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-3 text-[0.92rem] transition-[border-color,background-color,color,transform] duration-300 active:scale-[0.97] ${
                            selected ? 'border-navy bg-navy text-white' : 'border-line-strong bg-white text-ink hover:border-navy/50'
                          }`}
                        >
                          <span className={`grid h-5 w-5 place-items-center rounded-full border transition-colors ${selected ? 'border-white bg-white text-navy' : 'border-line-strong'}`} aria-hidden>
                            {selected && <Check className="h-3 w-3" />}
                          </span>
                          {concern.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 ref={heading} tabIndex={-1} className="display-sm text-navy outline-none">
                    Wanneer is beveiliging nodig?
                  </h2>
                  <p className="mt-3 text-[1rem] text-muted">Klik of sleep over de vakken, of kies een snelle selectie.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {SCHEDULE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setInput((current) => ({ ...current, schedule: preset.build() }))}
                        className="rounded-full border border-line-strong bg-white px-3.5 py-2 text-[0.85rem] text-navy transition-colors hover:border-navy"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setInput((current) => ({ ...current, schedule: emptySchedule() }))}
                      className="rounded-full px-3.5 py-2 text-[0.85rem] text-muted hover:text-navy"
                    >
                      Wissen
                    </button>
                  </div>
                  <div className="mt-6 rounded-[3px] border border-line bg-white p-3 sm:p-5">
                    <WeekGrid value={input.schedule} onChange={(schedule) => setInput((current) => ({ ...current, schedule }))} />
                  </div>
                  <p className="mt-3 text-[0.88rem] text-muted" aria-live="polite">
                    {scheduleText}
                  </p>
                  <fieldset className="mt-8">
                    <legend className="text-[0.95rem] font-medium text-navy">Voor welke periode?</legend>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {PERIODS.map((period) => {
                        const selected = input.period === period.id;
                        return (
                          <label
                            key={period.id}
                            className={`cursor-pointer rounded-[2px] border px-4 py-3 transition-colors ${selected ? 'border-navy bg-navy text-white' : 'border-line-strong bg-white hover:border-navy/50'}`}
                          >
                            <input
                              type="radio"
                              name="periode"
                              className="sr-only"
                              checked={selected}
                              onChange={() => setInput((current) => ({ ...current, period: period.id }))}
                            />
                            <span className="block text-[0.95rem] font-medium">{period.label}</span>
                            <span className={`block text-[0.78rem] ${selected ? 'text-white/65' : 'text-muted'}`}>{period.hint}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 ref={heading} tabIndex={-1} className="display-sm text-navy outline-none">
                    Dit past bij uw situatie.
                  </h2>
                  <p className="mt-3 max-w-[36rem] text-[1rem] leading-relaxed text-muted">
                    Op basis van uw keuzes sluiten deze diensten het beste aan. Tijdens een eerste gesprek kijken wij samen naar de details.
                  </p>
                  {recommendations.length === 0 ? (
                    <p className="mt-8 rounded-[3px] border border-line bg-white p-6 text-muted">
                      Maak in de vorige stappen een paar keuzes om passende diensten te zien.
                    </p>
                  ) : (
                    <ol className="mt-8 space-y-3">
                      {recommendations.map((item, index) => {
                        const service = byslug[item.slug];
                        if (!service) return null;
                        return (
                          <motion.li
                            key={item.slug}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.1 + index * 0.08 }}
                          >
                            <Link
                              href={`/diensten/${service.slug}`}
                              className="group grid grid-cols-[5.5rem_1fr] gap-4 rounded-[3px] border border-line bg-white p-3 transition-[border-color,box-shadow] hover:border-navy/40 hover:shadow-soft sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:p-4"
                            >
                              <span className="relative aspect-square overflow-hidden rounded-[2px] bg-mist sm:aspect-[4/3]">
                                <Photo image={service.image} sizes="128px" />
                              </span>
                              <span className="min-w-0 self-center">
                                <span className="font-mono text-[0.64rem] tracking-[0.14em] text-steel uppercase">
                                  {index === 0 ? 'Beste match' : `Optie ${String(index + 1).padStart(2, '0')}`}
                                </span>
                                <span className="mt-1 block text-[1.1rem] font-medium tracking-[-0.02em] text-navy">{service.title}</span>
                                <span className="mt-1 block text-[0.82rem] leading-snug text-muted">Omdat u koos voor: {item.reasons.join(' · ')}</span>
                              </span>
                              <span className="hidden sm:block">
                                <ArrowBadge variant="text" />
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ol>
                  )}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button type="button" onClick={toQuote} className={buttonClass('primary')}>
                      <span>Vraag offerte aan met dit profiel</span>
                      <ArrowBadge />
                    </button>
                    <button type="button" onClick={reset} className={buttonClass('secondary')}>
                      <RotateCcw className="h-4 w-4" aria-hidden /> Opnieuw beginnen
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 3 && (
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
            {step > 0 ? (
              <button type="button" onClick={() => goTo(step - 1)} className="inline-flex items-center gap-2 text-[0.95rem] text-muted hover:text-navy">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Vorige
              </button>
            ) : (
              <span className="text-[0.85rem] text-muted">Ongeveer één minuut</span>
            )}
            <button type="button" onClick={() => goTo(step + 1)} disabled={!canNext} className={buttonClass('primary')}>
              <span>{step === 2 ? 'Bekijk mijn profiel' : 'Volgende'}</span>
              <ArrowBadge />
            </button>
          </div>
        )}
      </div>

      <aside aria-label="Live beveiligingsprofiel" className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-28">{profile}</div>
      </aside>
    </div>
  );
}
