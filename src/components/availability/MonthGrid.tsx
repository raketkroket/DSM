'use client';

import { useSyncExternalStore } from 'react';
import { MONTHS, STATUS_META, WEEKDAYS, monthWeeks, toDay, type AvailabilityDay, type AvailabilityStatus } from '@/lib/availability';

const subscribe = () => () => {};
/** Today's date, read on the client only (keeps prerendered pages static). Empty during prerender. */
export function useToday() {
  return useSyncExternalStore(subscribe, () => toDay(new Date()), () => '');
}

export const STATUS_STYLES: Record<AvailabilityStatus, { cell: string; dot: string }> = {
  available: { cell: 'bg-success/12 text-success ring-success/30', dot: 'bg-success' },
  limited: { cell: 'bg-warning/12 text-warning ring-warning/30', dot: 'bg-warning' },
  unavailable: { cell: 'bg-ink/8 text-ink/45 line-through ring-ink/15', dot: 'bg-ink/40' },
};

type Props = {
  year: number;
  month: number;
  days: Record<string, AvailabilityDay>;
  today: string;
  selected?: Set<string>;
  disablePast?: boolean;
  onDayDown?: (day: string, additive: boolean) => void;
  onDayEnter?: (day: string) => void;
  onDayClick?: (day: string) => void;
  label?: (day: string) => string;
};

/** One month, Monday first. Each day is a button carrying its status in text, not only colour. */
export function MonthGrid({ year, month, days, today, selected, disablePast, onDayDown, onDayEnter, onDayClick, label }: Props) {
  const weeks = monthWeeks(year, month);
  const interactive = Boolean(onDayDown || onDayClick);
  return (
    <div>
      <p className="mb-3 text-[0.95rem] font-medium text-navy first-letter:uppercase">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center" role={interactive ? 'group' : 'list'} aria-label={`${MONTHS[month]} ${year}`}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="pb-1 text-[0.7rem] font-medium tracking-[0.08em] text-muted uppercase" aria-hidden>
            {weekday}
          </span>
        ))}
        {weeks.flat().map((day, index) => {
          if (!day) return <span key={`empty-${index}`} aria-hidden />;
          const entry = days[day];
          const past = Boolean(today) && day < today;
          const disabled = disablePast && past;
          const isSelected = selected?.has(day);
          const isToday = day === today;
          const style = entry ? STATUS_STYLES[entry.status].cell : 'text-ink';
          const statusText = entry ? STATUS_META[entry.status].label : 'Op aanvraag';
          const className = `relative grid aspect-square place-items-center rounded-[3px] text-[0.85rem] tabular-nums ring-1 ring-transparent transition-[background-color,box-shadow] duration-200 select-none ${style} ${
            isSelected ? 'ring-2! ring-navy! ring-offset-1' : ''
          } ${past && !disabled ? 'opacity-55' : ''}`;
          const ariaLabel = label ? label(day) : `${Number(day.slice(8))} ${MONTHS[month]}: ${statusText}${entry?.note ? ` — ${entry.note}` : ''}`;
          const marks = (
            <>
              {Number(day.slice(8))}
              {isToday && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-navy" aria-hidden />}
              {entry?.note && <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-current" aria-hidden />}
            </>
          );
          if (!interactive) {
            return (
              <span key={day} role="listitem" title={entry?.note || statusText} className={className}>
                <span aria-hidden className="contents">
                  {marks}
                </span>
                <span className="sr-only">{ariaLabel}</span>
              </span>
            );
          }
          return (
            <button
              key={day}
              type="button"
              data-day={day}
              disabled={disabled}
              aria-pressed={selected ? Boolean(isSelected) : undefined}
              aria-label={ariaLabel}
              title={entry?.note || statusText}
              onPointerDown={(event) => {
                if (!onDayDown || event.button !== 0) return;
                event.preventDefault();
                onDayDown(day, event.ctrlKey || event.metaKey || event.shiftKey);
              }}
              onPointerEnter={() => onDayEnter?.(day)}
              onClick={() => onDayClick?.(day)}
              className={`${className} cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 ${entry ? '' : 'hover:bg-mist'}`}
            >
              {marks}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-muted">
      {(Object.keys(STATUS_META) as AvailabilityStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[status].dot}`} aria-hidden />
          {STATUS_META[status].label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full border border-line-strong" aria-hidden />
        Op aanvraag
      </li>
    </ul>
  );
}
