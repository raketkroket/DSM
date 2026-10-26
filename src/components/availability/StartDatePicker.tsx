'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { STATUS_META, addDays, formatDay, parseDay, type AvailabilityDay } from '@/lib/availability';
import { Legend, MonthGrid, useToday } from './MonthGrid';

const HINT = 'Optioneel. Kies de dag waarop de beveiliging zou moeten starten.';

/** Optional start date for a quote: a native date field, plus the availability calendar when the owner keeps one. */
export function StartDatePicker({ value, onChange, days, error }: { value: string; onChange: (value: string) => void; days: AvailabilityDay[]; error?: string }) {
  const today = useToday();
  const [offset, setOffset] = useState(() => (value && today ? monthOffset(today, value) : 0));
  const future = today ? days.filter((entry) => entry.day >= today) : [];
  const map = Object.fromEntries(future.map((entry) => [entry.day, entry]));
  const chosen = value ? map[value] : undefined;
  const start = today ? parseDay(today) : null;
  const shown = start ? new Date(start.getFullYear(), start.getMonth() + offset, 1) : null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor="preferredDate" className="text-[0.92rem] font-medium text-navy">
          Gewenste startdatum
        </label>
        <span className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase">Optioneel</span>
      </div>
      <div className="flex gap-2">
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          value={value}
          min={today || undefined}
          max={today ? addDays(today, 731) : undefined}
          onChange={(event) => {
            onChange(event.target.value);
            if (event.target.value && today) setOffset(monthOffset(today, event.target.value));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'preferredDate-error' : 'preferredDate-hint'}
          className={`block h-[3.25rem] w-full rounded-[2px] border bg-white px-4 text-[1rem] text-ink outline-none transition-[border-color,box-shadow] duration-300 focus:border-navy focus:shadow-[0_0_0_4px_rgba(110,145,172,0.18)] ${
            error ? 'border-danger' : 'border-line-strong'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-[2px] border border-line-strong text-muted transition-colors hover:border-navy hover:text-navy"
            aria-label="Startdatum wissen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error ? (
        <p id="preferredDate-error" role="alert" className="mt-2 text-[0.85rem] text-danger">
          {error}
        </p>
      ) : (
        <p id="preferredDate-hint" className="mt-2 text-[0.85rem] text-muted" aria-live="polite">
          {value && today ? statusLine(value, chosen) : HINT}
        </p>
      )}

      {future.length > 0 && shown && (
        <div className="mt-5 rounded-[3px] border border-line bg-paper p-4 sm:p-5">
          <div className="relative z-10 mb-1 ml-auto flex w-fit items-center gap-1">
            <button
              type="button"
              onClick={() => setOffset((current) => current - 1)}
              disabled={offset === 0}
              aria-label="Vorige maand"
              className="grid h-9 w-9 place-items-center rounded-[3px] text-navy hover:bg-mist disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOffset((current) => current + 1)}
              disabled={offset >= 24}
              aria-label="Volgende maand"
              className="grid h-9 w-9 place-items-center rounded-[3px] text-navy hover:bg-mist disabled:opacity-35"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="-mt-10 max-w-[24rem]">
            <MonthGrid
              year={shown.getFullYear()}
              month={shown.getMonth()}
              days={map}
              today={today}
              selected={new Set(value ? [value] : [])}
              disablePast
              onDayClick={(day) => onChange(day === value ? '' : day)}
            />
          </div>
          <div className="mt-4">
            <Legend />
          </div>
        </div>
      )}
    </div>
  );
}

function monthOffset(from: string, to: string) {
  const a = parseDay(from);
  const b = parseDay(to);
  return Math.min(24, Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()));
}

function statusLine(day: string, entry?: AvailabilityDay) {
  const status = entry ? STATUS_META[entry.status].label : 'Beschikbaarheid op aanvraag';
  const extra = entry?.status === 'unavailable' ? ' We bespreken graag een alternatief.' : '';
  return `${formatDay(day)} · ${status}${entry?.note ? ` (${entry.note})` : ''}.${extra}`;
}
