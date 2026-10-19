import { describe, expect, it } from 'vitest';
import { SERVICE_SLUGS } from '@/lib/content/services';
import { describeSchedule, emptySchedule, layerFocus, plannerSummary, recommend, SCHEDULE_PRESETS, type PlannerInput } from '@/lib/planner';

const base = (overrides: Partial<PlannerInput> = {}): PlannerInput => ({
  location: null,
  concerns: [],
  schedule: emptySchedule(),
  period: null,
  ...overrides,
});
const preset = (id: string) => SCHEDULE_PRESETS.find((item) => item.id === id)!.build();

describe('recommend', () => {
  it('only ever suggests real service pages', () => {
    const all = recommend(base({ location: 'kantoor', concerns: ['toegang', 'ontvangst', 'diefstal', 'camera', 'risico', 'calamiteiten', 'drukte', 'overlast'], schedule: preset('altijd') }));
    for (const item of all) expect(SERVICE_SLUGS).toContain(item.slug);
    expect(all.length).toBeLessThanOrEqual(4);
  });

  it('puts the location-specific service first', () => {
    expect(recommend(base({ location: 'bouwplaats' }))[0].slug).toBe('bouwplaatsbeveiliging');
    expect(recommend(base({ location: 'evenement' }))[0].slug).toBe('evenementenbeveiliging');
    expect(recommend(base({ location: 'winkel' }))[0].slug).toBe('winkelsurveillance');
  });

  it('adds camera supervision and explains why for out-of-hours construction sites', () => {
    const result = recommend(base({ location: 'bouwplaats', concerns: ['diefstal'], schedule: preset('buiten') }));
    const camera = result.find((item) => item.slug === 'cameratoezicht');
    expect(camera?.reasons).toEqual(expect.arrayContaining(['diefstal en vandalisme', 'beveiliging buiten werktijden']));
  });

  it('points risk questions to the safety experts', () => {
    expect(recommend(base({ location: 'kantoor', concerns: ['risico'] })).map((item) => item.slug)).toContain('veiligheidskundigen-en-risicoanalyses');
  });

  it('suggests a tailored approach when several strong needs combine', () => {
    const result = recommend(base({ location: 'kantoor', concerns: ['ontvangst', 'camera', 'risico'] }));
    expect(result.map((item) => item.slug)).toContain('beveiliging-op-maat');
  });

  it('returns nothing before any choice is made', () => {
    expect(recommend(base())).toEqual([]);
  });
});

describe('schedule and summary', () => {
  it('describes common schedules in plain Dutch', () => {
    expect(describeSchedule(emptySchedule())).toBe('Nog geen momenten gekozen');
    expect(describeSchedule(preset('altijd'))).toBe('24 uur per dag, 7 dagen per week');
    expect(describeSchedule(preset('kantoor'))).toBe('ochtend en middag: ma–vr');
    expect(describeSchedule(preset('buiten'))).toBe('ochtend en middag: za–zo · avond en nacht: elke dag');
  });

  it('splits focus across the three layers', () => {
    expect(layerFocus(['toegang', 'camera'])).toEqual({ mensen: 0.5, eigendommen: 0.5, processen: 0 });
  });

  it('builds a readable quote message', () => {
    const text = plannerSummary(base({ location: 'winkel', concerns: ['diefstal'], schedule: preset('weekend'), period: 'doorlopend' }), {
      winkelsurveillance: 'Winkelsurveillance',
      cameratoezicht: 'Cameratoezicht',
    });
    expect(text).toContain('Type locatie: Winkel of winkelcentrum');
    expect(text).toContain('Periode: Doorlopend');
    expect(text).toContain('Passende diensten: Winkelsurveillance');
  });
});
