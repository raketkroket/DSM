import Link from 'next/link';
import { Building2, HardHat, Store, Ticket } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { ArrowBadge } from '@/components/site/Button';
import { PARTS, DAYS } from '@/lib/planner';

const TILES = [
  { icon: Building2, label: 'Kantoor' },
  { icon: HardHat, label: 'Bouwplaats' },
  { icon: Ticket, label: 'Evenement' },
  { icon: Store, label: 'Winkel' },
];

/** Static preview of the planner: a hint of the tiles and the week grid, linking to the real tool. */
const PREVIEW = PARTS.map((_, p) => DAYS.map((_, d) => d >= 5 || p >= 2));

export function PlannerTeaser() {
  return (
    <section aria-labelledby="planner-teaser" className="pb-24 md:pb-36">
      <div className="shell">
        <Reveal>
          <Link
            href="/beveiligingsplanner"
            className="group relative grid grid-cols-1 overflow-hidden rounded-[3px] border border-line bg-white shadow-soft transition-shadow duration-700 hover:shadow-panel lg:grid-cols-12"
          >
            <div className="relative z-10 p-7 sm:p-10 lg:col-span-6 lg:p-14">
              <p className="eyebrow">Beveiligingsplanner</p>
              <h2 id="planner-teaser" className="display-md mt-6 max-w-[14ch] text-navy">
                Stel uw beveiliging <span className="accent">zelf samen.</span>
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.05rem] leading-relaxed text-muted">
                Kies uw locatie, uw aandachtspunten en de momenten waarop beveiliging nodig is. U ziet direct welke diensten passen.
              </p>
              <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-navy py-2 pr-2 pl-6 text-[0.95rem] font-medium text-white">
                Start de planner <ArrowBadge />
              </span>
            </div>
            <div className="blueprint relative flex flex-col justify-center gap-6 border-t border-line bg-paper p-7 sm:p-10 lg:col-span-6 lg:border-t-0 lg:border-l" aria-hidden>
              <div className="grid grid-cols-4 gap-2">
                {TILES.map(({ icon: Icon, label }, index) => (
                  <span
                    key={label}
                    className={`flex flex-col items-start gap-6 rounded-[2px] border p-3 text-[0.75rem] transition-transform duration-700 ease-[var(--ease-arch)] group-hover:-translate-y-1 ${
                      index === 1 ? 'border-navy bg-navy text-white' : 'border-line bg-white text-ink'
                    }`}
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="rounded-[2px] border border-line bg-white p-3">
                <div className="grid grid-cols-7 gap-1">
                  {PREVIEW.flatMap((row, p) =>
                    row.map((on, d) => (
                      <span
                        key={`${p}-${d}`}
                        className={`h-4 rounded-[4px] transition-colors duration-500 ${on ? 'bg-navy group-hover:bg-navy-soft' : 'bg-mist'}`}
                        style={{ transitionDelay: `${(p * 7 + d) * 12}ms` }}
                      />
                    )),
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Bouwplaatsbeveiliging', 'Cameratoezicht'].map((service, index) => (
                  <span key={service} className="flex items-center gap-2 rounded-full bg-navy-deep px-3 py-1.5 text-[0.75rem] text-white">
                    <span className="font-mono text-[0.6rem] text-steel-soft">0{index + 1}</span>
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
