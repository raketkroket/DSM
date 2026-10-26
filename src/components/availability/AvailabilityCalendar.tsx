'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatDay, parseDay, type AvailabilityDay } from '@/lib/availability';
import { Legend, MonthGrid, STATUS_STYLES, useToday } from './MonthGrid';

/** Months between today and the date, counted from the first of today's month. */
function monthsBetween(from: string, to: string) {
  const a = parseDay(from);
  const b = parseDay(to);
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
}

/** Read-only availability for visitors: two months at a time, as far ahead as the owner has planned. */
export function AvailabilityCalendar({ days }: { days: AvailabilityDay[] }) {
  const today = useToday();
  const [offset, setOffset] = useState(0);
  if (!today) return <div className="min-h-[22rem]" aria-hidden />;

  const future = days.filter((entry) => entry.day >= today);
  if (future.length === 0) return null;
  const map = Object.fromEntries(future.map((entry) => [entry.day, entry]));
  const lastOffset = Math.max(0, monthsBetween(today, future[future.length - 1].day) - 1);
  const start = parseDay(today);
  const months = [0, 1].map((step) => {
    const date = new Date(start.getFullYear(), start.getMonth() + offset + step, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  const notes = future.filter((entry) => entry.note).slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Legend />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setOffset((value) => value - 1)}
            disabled={offset === 0}
            aria-label="Vorige maanden"
            className="grid h-10 w-10 place-items-center rounded-[3px] border border-line-strong text-navy transition-colors hover:border-navy disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((value) => value + 1)}
            disabled={offset >= lastOffset}
            aria-label="Volgende maanden"
            className="grid h-10 w-10 place-items-center rounded-[3px] border border-line-strong text-navy transition-colors hover:border-navy disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2" aria-live="polite">
        {months.map(({ year, month }) => (
          <MonthGrid key={`${year}-${month}`} year={year} month={month} days={map} today={today} />
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[0.88rem]">
          {notes.map((entry) => (
            <li key={entry.day} className="flex gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_STYLES[entry.status].dot}`} aria-hidden />
              <span>
                <span className="text-navy">{formatDay(entry.day)}</span> <span className="text-muted">— {entry.note}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
