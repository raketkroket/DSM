/**
 * Beveiligingsplanner: turns a visitor's situation into a security profile and a ranked set of
 * matching services. Purely rule-based on the client's own service descriptions — no prices,
 * no scores presented as measurements.
 */

export type LocationId = 'kantoor' | 'bouwplaats' | 'evenement' | 'winkel' | 'recreatie' | 'opslag' | 'anders';
export type ConcernId = 'toegang' | 'diefstal' | 'drukte' | 'overlast' | 'camera' | 'risico' | 'ontvangst' | 'calamiteiten';
export type PeriodId = 'eenmalig' | 'tijdelijk' | 'doorlopend';
export type Layer = 'mensen' | 'eigendommen' | 'processen';

export const LOCATIONS: { id: LocationId; label: string; hint: string }[] = [
  { id: 'kantoor', label: 'Kantoor of bedrijfspand', hint: 'Medewerkers, bezoekers en bedrijfsmiddelen' },
  { id: 'bouwplaats', label: 'Bouwplaats', hint: 'Materialen, materieel en toegangswegen' },
  { id: 'evenement', label: 'Evenement', hint: 'Zakelijk, festival, beurs of besloten' },
  { id: 'winkel', label: 'Winkel of winkelcentrum', hint: 'Klanten, medewerkers en voorraad' },
  { id: 'recreatie', label: 'Recreatielocatie', hint: 'Vakantiepark, terrein of bezoekerslocatie' },
  { id: 'opslag', label: 'Opslag of industrieterrein', hint: 'Terreinen, hallen en afsluitingen' },
  { id: 'anders', label: 'Iets anders', hint: 'Een combinatie of bijzondere situatie' },
];

export const CONCERNS: { id: ConcernId; label: string; layer: Layer }[] = [
  { id: 'toegang', label: 'Toegang en bezoekersregistratie', layer: 'mensen' },
  { id: 'ontvangst', label: 'Representatieve ontvangst', layer: 'mensen' },
  { id: 'drukte', label: 'Drukte en bezoekersstromen', layer: 'mensen' },
  { id: 'overlast', label: 'Overlast en ongewenst gedrag', layer: 'mensen' },
  { id: 'diefstal', label: 'Diefstal en vandalisme', layer: 'eigendommen' },
  { id: 'camera', label: 'Toezicht via camera’s', layer: 'eigendommen' },
  { id: 'risico', label: 'Inzicht in risico’s', layer: 'processen' },
  { id: 'calamiteiten', label: 'Afspraken bij incidenten en calamiteiten', layer: 'processen' },
];

export const PERIODS: { id: PeriodId; label: string; hint: string }[] = [
  { id: 'eenmalig', label: 'Eenmalig', hint: 'Bijvoorbeeld één evenement of dag' },
  { id: 'tijdelijk', label: 'Tijdelijk', hint: 'Een project of seizoen' },
  { id: 'doorlopend', label: 'Doorlopend', hint: 'Structurele beveiliging' },
];

export const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'] as const;
export const DAYS_LONG = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'] as const;
export const PARTS = [
  { label: 'Ochtend', hours: '06–12' },
  { label: 'Middag', hours: '12–18' },
  { label: 'Avond', hours: '18–24' },
  { label: 'Nacht', hours: '00–06' },
] as const;

/** Week grid: schedule[part][day]. */
export type Schedule = boolean[][];
export const emptySchedule = (): Schedule => PARTS.map(() => DAYS.map(() => false));

export const SCHEDULE_PRESETS: { id: string; label: string; build: () => Schedule }[] = [
  { id: 'kantoor', label: 'Kantooruren', build: () => PARTS.map((_, p) => DAYS.map((_, d) => d < 5 && (p === 0 || p === 1))) },
  { id: 'buiten', label: 'Buiten kantooruren', build: () => PARTS.map((_, p) => DAYS.map((_, d) => d >= 5 || p >= 2)) },
  { id: 'weekend', label: 'Weekend', build: () => PARTS.map(() => DAYS.map((_, d) => d >= 5)) },
  { id: 'altijd', label: '24/7', build: () => PARTS.map(() => DAYS.map(() => true)) },
];

export type PlannerInput = {
  location: LocationId | null;
  concerns: ConcernId[];
  schedule: Schedule;
  period: PeriodId | null;
};

type Rule = { slug: string; weight: number; reason: string };

const LOCATION_RULES: Record<LocationId, Rule[]> = {
  kantoor: [
    { slug: 'objectbewaking', weight: 3, reason: 'kantoor of bedrijfspand' },
    { slug: 'receptiediensten', weight: 2, reason: 'kantoor of bedrijfspand' },
  ],
  bouwplaats: [{ slug: 'bouwplaatsbeveiliging', weight: 5, reason: 'bouwplaats' }],
  evenement: [{ slug: 'evenementenbeveiliging', weight: 5, reason: 'evenement' }],
  winkel: [{ slug: 'winkelsurveillance', weight: 5, reason: 'winkel' }],
  recreatie: [{ slug: 'recreatiebeveiliging', weight: 5, reason: 'recreatielocatie' }],
  opslag: [
    { slug: 'objectbewaking', weight: 4, reason: 'opslag of industrieterrein' },
    { slug: 'cameratoezicht', weight: 1, reason: 'opslag of industrieterrein' },
  ],
  anders: [{ slug: 'beveiliging-op-maat', weight: 4, reason: 'bijzondere situatie' }],
};

function concernRules(concern: ConcernId, location: LocationId | null): Rule[] {
  const reason = CONCERNS.find((item) => item.id === concern)!.label.toLowerCase();
  switch (concern) {
    case 'toegang':
      return [
        { slug: location === 'evenement' ? 'evenementenbeveiliging' : 'receptiediensten', weight: 2, reason },
        { slug: 'objectbewaking', weight: 1, reason },
      ];
    case 'ontvangst':
      return [{ slug: 'receptiediensten', weight: 3, reason }];
    case 'drukte':
      return [{ slug: location === 'recreatie' ? 'recreatiebeveiliging' : 'evenementenbeveiliging', weight: 2, reason }];
    case 'overlast':
      return [
        {
          slug: location === 'winkel' ? 'winkelsurveillance' : location === 'evenement' ? 'evenementenbeveiliging' : 'recreatiebeveiliging',
          weight: 2,
          reason,
        },
      ];
    case 'diefstal':
      return [
        {
          slug: location === 'bouwplaats' ? 'bouwplaatsbeveiliging' : location === 'winkel' ? 'winkelsurveillance' : 'objectbewaking',
          weight: 2,
          reason,
        },
        { slug: 'cameratoezicht', weight: 1, reason },
      ];
    case 'camera':
      return [{ slug: 'cameratoezicht', weight: 4, reason }];
    case 'risico':
      return [{ slug: 'veiligheidskundigen-en-risicoanalyses', weight: 4, reason }];
    case 'calamiteiten':
      return [{ slug: 'veiligheidskundigen-en-risicoanalyses', weight: 2, reason }];
  }
}

export function scheduleStats(schedule: Schedule) {
  let total = 0;
  let night = 0;
  let weekend = 0;
  schedule.forEach((row, part) =>
    row.forEach((on, day) => {
      if (!on) return;
      total++;
      if (part === 3 || part === 2) night++;
      if (day >= 5) weekend++;
    }),
  );
  return { total, outOfHours: night + weekend > 0, allWeek: total === PARTS.length * DAYS.length };
}

export type Recommendation = { slug: string; score: number; reasons: string[] };

export function recommend(input: PlannerInput): Recommendation[] {
  const rules: Rule[] = [];
  if (input.location) rules.push(...LOCATION_RULES[input.location]);
  for (const concern of input.concerns) rules.push(...concernRules(concern, input.location));

  const stats = scheduleStats(input.schedule);
  if (stats.outOfHours && input.location) {
    const reason = 'beveiliging buiten werktijden';
    if (input.location === 'bouwplaats') rules.push({ slug: 'bouwplaatsbeveiliging', weight: 1, reason });
    if (input.location === 'kantoor' || input.location === 'opslag') rules.push({ slug: 'objectbewaking', weight: 1, reason });
    rules.push({ slug: 'cameratoezicht', weight: 1, reason });
  }

  const map = new Map<string, Recommendation>();
  for (const rule of rules) {
    const current = map.get(rule.slug) ?? { slug: rule.slug, score: 0, reasons: [] };
    current.score += rule.weight;
    if (!current.reasons.includes(rule.reason)) current.reasons.push(rule.reason);
    map.set(rule.slug, current);
  }

  const ranked = [...map.values()].filter((item) => item.score >= 2).sort((a, b) => b.score - a.score);
  // Several strong needs together are exactly what "beveiliging op maat" is for.
  const strong = ranked.filter((item) => item.score >= 3 && item.slug !== 'beveiliging-op-maat');
  if (strong.length >= 3 && !map.has('beveiliging-op-maat')) {
    return [...ranked.slice(0, 3), { slug: 'beveiliging-op-maat', score: 3, reasons: ['combinatie van meerdere beveiligingsvormen'] }];
  }
  return ranked.slice(0, 4);
}

/** Share of the selected concerns per layer (focus, not a measurement). */
export function layerFocus(concerns: ConcernId[]): Record<Layer, number> {
  const counts: Record<Layer, number> = { mensen: 0, eigendommen: 0, processen: 0 };
  for (const concern of concerns) counts[CONCERNS.find((item) => item.id === concern)!.layer]++;
  const total = concerns.length || 1;
  return { mensen: counts.mensen / total, eigendommen: counts.eigendommen / total, processen: counts.processen / total };
}

function dayRanges(days: number[]) {
  if (days.length === 7) return 'elke dag';
  const ranges: string[] = [];
  let start = days[0];
  for (let i = 1; i <= days.length; i++) {
    if (days[i] !== days[i - 1] + 1) {
      const end = days[i - 1];
      ranges.push(start === end ? DAYS[start].toLowerCase() : `${DAYS[start].toLowerCase()}–${DAYS[end].toLowerCase()}`);
      start = days[i];
    }
  }
  return ranges.join(', ');
}

/** Human-readable schedule, e.g. "24/7" or "ochtend en middag: ma–vr · nacht: za–zo". */
export function describeSchedule(schedule: Schedule) {
  const stats = scheduleStats(schedule);
  if (stats.total === 0) return 'Nog geen momenten gekozen';
  if (stats.allWeek) return '24 uur per dag, 7 dagen per week';
  const groups = new Map<string, string[]>();
  schedule.forEach((row, part) => {
    const days = row.flatMap((on, day) => (on ? [day] : []));
    if (!days.length) return;
    const key = dayRanges(days);
    groups.set(key, [...(groups.get(key) ?? []), PARTS[part].label.toLowerCase()]);
  });
  return [...groups.entries()].map(([days, parts]) => `${parts.join(' en ')}: ${days}`).join(' · ');
}

export function plannerSummary(input: PlannerInput, serviceTitles: Record<string, string>) {
  const location = LOCATIONS.find((item) => item.id === input.location)?.label ?? '—';
  const concerns = input.concerns.map((id) => CONCERNS.find((item) => item.id === id)!.label);
  const period = PERIODS.find((item) => item.id === input.period)?.label ?? '—';
  const services = recommend(input)
    .filter((item) => serviceTitles[item.slug])
    .map((item) => serviceTitles[item.slug]);
  return [
    'Samengesteld met de beveiligingsplanner:',
    `• Type locatie: ${location}`,
    `• Aandachtspunten: ${concerns.length ? concerns.join(', ') : '—'}`,
    `• Beveiligingsmomenten: ${describeSchedule(input.schedule)}`,
    `• Periode: ${period}`,
    `• Passende diensten: ${services.length ? services.join(', ') : '—'}`,
  ].join('\n');
}

export const PLANNER_STORAGE_KEY = 'dsm-planner-profiel';
