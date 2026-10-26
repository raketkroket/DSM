'use client';

import { ChevronLeft, ChevronRight, Eraser, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Legend, MonthGrid, STATUS_STYLES, useToday } from '@/components/availability/MonthGrid';
import { setAvailability } from '@/lib/admin/actions/availability';
import { STATUSES, STATUS_META, dayRange, formatDay, monthWeeks, parseDay, type AvailabilityDay, type AvailabilityStatus } from '@/lib/availability';
import { Card, CardHeader, adminButton } from './ui';
import { useToast } from './Toaster';

const MAX_MONTHS_AHEAD = 24;

/** Calendar editor: select days (click, drag or keyboard), then give them a status. */
export function AvailabilityEditor({ initial, serverToday }: { initial: AvailabilityDay[]; serverToday: string }) {
  const today = useToday() || serverToday;
  const [days, setDays] = useState(() => Object.fromEntries(initial.map((entry) => [entry.day, entry])));
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const notify = useToast();
  const anchor = useRef<string | null>(null);
  const base = useRef<Set<string>>(new Set());
  const usedPointer = useRef(false);

  const start = parseDay(today);
  const months = [0, 1].map((step) => {
    const date = new Date(start.getFullYear(), start.getMonth() + offset + step, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  // A drag ends wherever the pointer is released.
  useEffect(() => {
    const end = () => (anchor.current = null);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  const extendTo = (day: string) => {
    if (!anchor.current || day < today) return;
    setSelected(new Set([...base.current, ...dayRange(anchor.current, day).filter((item) => item >= today)]));
  };

  const onDayDown = (day: string, additive: boolean) => {
    usedPointer.current = true;
    anchor.current = day;
    base.current = additive ? new Set(selected) : new Set();
    if (additive && selected.has(day)) {
      const next = new Set(selected);
      next.delete(day);
      base.current = next;
      setSelected(next);
      anchor.current = null;
      return;
    }
    setSelected(new Set([...base.current, day]));
  };

  // Keyboard (Enter/Space) toggles one day; pointer clicks were already handled on pointer down.
  const onDayClick = (day: string) => {
    if (usedPointer.current) {
      usedPointer.current = false;
      return;
    }
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const selectWeekdays = () => {
    const visible = months.flatMap(({ year, month }) => monthWeeks(year, month).flatMap((week) => week.slice(0, 5)));
    setSelected(new Set(visible.filter((day): day is string => Boolean(day) && day! >= today)));
  };

  const apply = (status: AvailabilityStatus | null) => {
    const list = [...selected].sort();
    if (list.length === 0) return;
    startTransition(async () => {
      const result = await setAvailability(list, status, note);
      notify(result.ok ? 'success' : 'error', result.message);
      if (!result.ok) return;
      setDays((current) => {
        const next = { ...current };
        for (const day of list) {
          if (status) next[day] = { day, status, note: note.trim().slice(0, 200) };
          else delete next[day];
        }
        return next;
      });
      setSelected(new Set());
    });
  };

  const sorted = [...selected].sort();
  const single = sorted.length === 1 ? days[sorted[0]] : undefined;
  const upcoming = Object.values(days)
    .filter((entry) => entry.day >= today && entry.note)
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader
          title="Kalender"
          description="Klik op een dag of sleep over meerdere dagen. Houd Ctrl of Shift ingedrukt om dagen toe te voegen."
          action={
            <div className="flex items-center gap-1">
              <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line-strong text-navy transition-colors hover:border-navy disabled:opacity-35" onClick={() => setOffset((value) => value - 1)} disabled={offset <= 0} aria-label="Vorige maand">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line-strong text-navy transition-colors hover:border-navy disabled:opacity-35" onClick={() => setOffset((value) => value + 1)} disabled={offset >= MAX_MONTHS_AHEAD} aria-label="Volgende maand">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />
        <div
          className="grid touch-none grid-cols-1 gap-8 p-5 md:grid-cols-2"
          onPointerMove={(event) => {
            if (!anchor.current) return;
            const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-day]');
            if (target?.dataset.day) extendTo(target.dataset.day);
          }}
        >
          {months.map(({ year, month }) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              days={days}
              today={today}
              selected={selected}
              disablePast
              onDayDown={onDayDown}
              onDayClick={onDayClick}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
          <Legend />
          <div className="flex flex-wrap gap-2 text-[0.85rem]">
            <button type="button" className="text-steel underline-offset-4 hover:text-navy hover:underline" onClick={selectWeekdays}>
              Selecteer alle werkdagen
            </button>
            {selected.size > 0 && (
              <button type="button" className="text-steel underline-offset-4 hover:text-navy hover:underline" onClick={() => setSelected(new Set())}>
                Selectie opheffen
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="xl:sticky xl:top-6">
          <CardHeader title="Status geven" description={selected.size ? describeSelection(sorted) : 'Selecteer eerst een of meer dagen.'} />
          <div className="space-y-4 p-5">
            {single && (
              <p className="rounded-xl bg-mist px-3 py-2 text-[0.85rem] text-ink">
                Nu: <strong className="font-medium">{STATUS_META[single.status].label}</strong>
                {single.note && <> — {single.note}</>}
              </p>
            )}
            <label className="block text-[0.85rem] font-medium text-navy" htmlFor="availability-note">
              Notitie op de website <span className="font-normal text-muted">(optioneel)</span>
            </label>
            <input
              id="availability-note"
              value={note}
              maxLength={200}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Bijvoorbeeld: alleen avonddiensten"
              className="h-10 w-full rounded-xl border border-line-strong bg-white px-3 text-[0.9rem] outline-none focus:border-navy"
            />
            <div className="grid gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={pending || selected.size === 0}
                  onClick={() => apply(status)}
                  className={adminButton('secondary', 'justify-start')}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[status].dot}`} aria-hidden />
                  {STATUS_META[status].label}
                </button>
              ))}
              <button type="button" disabled={pending || selected.size === 0} onClick={() => apply(null)} className={adminButton('ghost', 'justify-start')}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Eraser className="h-4 w-4" aria-hidden />}
                Wissen (op aanvraag)
              </button>
            </div>
            <p className="text-[0.8rem] leading-relaxed text-muted">Wijzigingen worden direct bewaard en staan binnen enkele minuten op de website. Dagen zonder status tonen “Op aanvraag”.</p>
          </div>
        </Card>

        {upcoming.length > 0 && (
          <Card>
            <CardHeader title="Komende notities" />
            <ul className="divide-y divide-line text-[0.85rem]">
              {upcoming.map((entry) => (
                <li key={entry.day} className="flex gap-3 px-5 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_STYLES[entry.status].dot}`} aria-hidden />
                  <span>
                    <span className="block text-navy">{formatDay(entry.day)}</span>
                    <span className="text-muted">{entry.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function describeSelection(days: string[]) {
  if (days.length === 1) return formatDay(days[0]);
  const contiguous = dayRange(days[0], days[days.length - 1]).length === days.length;
  return contiguous ? `${formatDay(days[0])} t/m ${formatDay(days[days.length - 1])} (${days.length} dagen)` : `${days.length} dagen geselecteerd`;
}
