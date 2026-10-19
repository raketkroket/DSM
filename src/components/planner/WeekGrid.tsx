'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import { DAYS, DAYS_LONG, PARTS, type Schedule } from '@/lib/planner';

/**
 * Week × part-of-day grid. Click a cell, or press and drag (mouse or touch) across cells to
 * paint them. Every cell is also a toggle button for keyboard and screen-reader users.
 */
export function WeekGrid({ value, onChange, readOnly = false, tone = 'light' }: { value: Schedule; onChange?: (next: Schedule) => void; readOnly?: boolean; tone?: 'light' | 'dark' }) {
  const painting = useRef<boolean | null>(null);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const last = useRef<{ part: number; day: number } | null>(null);

  /** Paints every cell on the straight line from the previous cell, so fast strokes skip nothing. */
  const paint = (part: number, day: number, on: boolean) => {
    if (!onChange) return;
    const from = last.current ?? { part, day };
    const steps = Math.max(Math.abs(part - from.part), Math.abs(day - from.day), 1);
    const next = latest.current.map((row) => [...row]);
    let changed = false;
    for (let i = 0; i <= steps; i++) {
      const p = Math.round(from.part + ((part - from.part) * i) / steps);
      const d = Math.round(from.day + ((day - from.day) * i) / steps);
      if (next[p][d] !== on) {
        next[p][d] = on;
        changed = true;
      }
    }
    last.current = { part, day };
    if (!changed) return;
    latest.current = next;
    onChange(next);
  };

  const set = (part: number, day: number, on: boolean) => {
    last.current = { part, day };
    paint(part, day, on);
  };

  const stop = () => {
    painting.current = null;
    last.current = null;
  };

  const cellAt = (event: PointerEvent) => {
    const element = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell]');
    if (!element) return null;
    return { part: Number(element.dataset.part), day: Number(element.dataset.day) };
  };

  const dark = tone === 'dark';

  return (
    <div
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? 'Gekozen beveiligingsmomenten' : 'Kies de gewenste beveiligingsmomenten'}
      className={`select-none ${readOnly ? '' : 'touch-none'}`}
      onPointerMove={(event) => {
        if (painting.current === null) return;
        const cell = cellAt(event);
        if (cell) paint(cell.part, cell.day, painting.current);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-1 sm:gap-1.5">
        <span />
        {DAYS.map((day, index) => (
          <span key={day} className={`pb-1 text-center font-mono text-[0.62rem] tracking-[0.1em] uppercase ${dark ? 'text-white/55' : 'text-muted'} ${index >= 5 ? 'opacity-80' : ''}`}>
            {day}
          </span>
        ))}
        {PARTS.map((part, p) => (
          <div key={part.label} className="contents">
            <span className={`flex flex-col justify-center pr-2 ${readOnly ? 'text-[0.62rem]' : 'text-[0.72rem] sm:text-[0.8rem]'} ${dark ? 'text-white/70' : 'text-ink'}`}>
              {part.label}
              {!readOnly && <span className="font-mono text-[0.58rem] text-muted">{part.hours}</span>}
            </span>
            {DAYS.map((day, d) => {
              const on = value[p][d];
              const label = `${DAYS_LONG[d]} ${part.label.toLowerCase()} (${part.hours} uur)`;
              const base = readOnly ? 'h-3.5 rounded-[3px]' : 'h-10 rounded-lg sm:h-12';
              const color = on
                ? dark
                  ? 'bg-steel-soft'
                  : 'bg-navy shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                : dark
                  ? 'bg-white/10'
                  : 'bg-white ring-1 ring-line-strong ring-inset hover:bg-steel-wash';
              return readOnly ? (
                <span key={day} className={`${base} ${color} transition-colors duration-300`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  data-cell
                  data-part={p}
                  data-day={d}
                  aria-pressed={on}
                  aria-label={label}
                  title={label}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    painting.current = !on;
                    set(p, d, !on);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      set(p, d, !on);
                    }
                  }}
                  className={`${base} ${color} transition-[background-color,transform] duration-200 active:scale-95`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
