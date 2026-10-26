/** Availability calendar: shared types and pure date helpers (no time zones; days are YYYY-MM-DD). */

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';
export type AvailabilityDay = { day: string; status: AvailabilityStatus; note: string };

export const STATUSES: AvailabilityStatus[] = ['available', 'limited', 'unavailable'];

export const STATUS_META: Record<AvailabilityStatus, { label: string; short: string }> = {
  available: { label: 'Beschikbaar', short: 'Vrij' },
  limited: { label: 'Beperkt beschikbaar', short: 'Beperkt' },
  unavailable: { label: 'Volgeboekt', short: 'Vol' },
};

export const DAY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
export const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toDay(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDay(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidDay(day: string) {
  if (!DAY_PATTERN.test(day)) return false;
  return toDay(parseDay(day)) === day; // rejects 2026-02-30
}

export function addDays(day: string, amount: number) {
  const date = parseDay(day);
  date.setDate(date.getDate() + amount);
  return toDay(date);
}

/** Monday-first weeks covering a month; days outside the month are null. */
export function monthWeeks(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(offset).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** All days from `from` to `to` inclusive (either order). */
export function dayRange(from: string, to: string) {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const days: string[] = [];
  for (let day = start; day <= end && days.length < 400; day = addDays(day, 1)) days.push(day);
  return days;
}

export function formatDay(day: string) {
  const date = parseDay(day);
  return `${WEEKDAYS[(date.getDay() + 6) % 7]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Today's date in the Netherlands, independent of the server's time zone. */
export function todayInAmsterdam(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Checks a requested start date: optional, real, not in the past and at most two years ahead. */
export function preferredDateIssue(day: string, today: string) {
  if (day === '') return null;
  if (!isValidDay(day)) return 'Kies een geldige datum.';
  if (day < today) return 'Kies een datum vanaf vandaag.';
  if (day > addDays(today, 731)) return 'Kies een datum binnen twee jaar.';
  return null;
}
