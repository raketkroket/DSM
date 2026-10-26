import { describe, expect, it } from 'vitest';
import { addDays, dayRange, formatDay, isValidDay, monthWeeks, preferredDateIssue, todayInAmsterdam } from '@/lib/availability';
import { contrastRatio, resolveTheme, themeCss } from '@/lib/theme';

describe('availability dates', () => {
  it('accepts real calendar days only', () => {
    expect(isValidDay('2026-11-02')).toBe(true);
    expect(isValidDay('2028-02-29')).toBe(true);
    expect(isValidDay('2026-02-29')).toBe(false);
    expect(isValidDay('2026-13-01')).toBe(false);
    expect(isValidDay('2-11-2026')).toBe(false);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('builds Monday-first weeks', () => {
    const weeks = monthWeeks(2026, 10); // November 2026 starts on a Sunday
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });

  it('expands a range in either direction', () => {
    expect(dayRange('2026-11-03', '2026-11-01')).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
  });

  it('formats days in Dutch', () => {
    expect(formatDay('2026-11-02')).toBe('ma 2 november 2026');
  });

  it('uses the Dutch date, not the server date', () => {
    expect(todayInAmsterdam(new Date('2026-10-26T23:30:00Z'))).toBe('2026-10-27');
  });

  it('validates a requested start date', () => {
    expect(preferredDateIssue('', '2026-10-26')).toBeNull();
    expect(preferredDateIssue('2026-10-26', '2026-10-26')).toBeNull();
    expect(preferredDateIssue('2026-10-25', '2026-10-26')).toMatch(/vanaf vandaag/);
    expect(preferredDateIssue('2029-01-01', '2026-10-26')).toMatch(/twee jaar/);
    expect(preferredDateIssue('2026-02-30', '2026-01-01')).toMatch(/geldige/);
  });
});

describe('brand colours', () => {
  const empty = { primaryColor: '', deepColor: '', textColor: '', backgroundColor: '' };

  it('emits no CSS for the default palette', () => {
    expect(themeCss(empty)).toBe('');
  });

  it('maps valid colours onto the design tokens and ignores invalid ones', () => {
    const css = themeCss({ ...empty, primaryColor: '#1A3355', textColor: 'red;}body{display:none' });
    expect(css).toContain('--color-navy:#1a3355');
    expect(css).toContain('--color-ink:#24282d');
    expect(css).not.toContain('display:none');
    expect(resolveTheme({ ...empty, deepColor: '#abc' }).deepColor).toBe('#0c1726');
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#14243a', '#ffffff')).toBeGreaterThan(4.5);
  });
});
