import { Reveal } from '@/components/motion/Reveal';
import { JsonLd } from './JsonLd';
import { faqJsonLd } from '@/lib/seo';
import type { FaqContent } from '@/lib/content/types';

/** Native <details> keeps the accordion accessible and functional without JavaScript. */
export function Faq({ faq, withSchema = true }: { faq: FaqContent; withSchema?: boolean }) {
  return (
    <section aria-labelledby="faq-titel" className="py-24 md:py-36">
      {withSchema && <JsonLd data={faqJsonLd(faq)} />}
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 id="faq-titel" className="display-md mt-6 max-w-[14ch] text-navy">
            {faq.title}
          </h2>
        </Reveal>
        <div className="lg:col-span-7 lg:col-start-6">
          {faq.items.map((item, index) => (
            <Reveal key={item.question} delay={index * 0.04}>
              <details className="group border-b border-line first:border-t [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start gap-6 py-6 text-left">
                  <span className="mt-1.5 font-mono text-[0.7rem] text-steel">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-[1.12rem] leading-snug font-medium tracking-[-0.015em] text-navy md:text-[1.3rem]">
                    {item.question}
                  </span>
                  <span className="relative mt-1.5 h-6 w-6 shrink-0 rounded-full border border-line transition-colors group-open:border-navy group-open:bg-navy" aria-hidden>
                    <span className="absolute top-1/2 left-1/2 h-px w-2.5 -translate-x-1/2 -translate-y-1/2 bg-navy group-open:bg-white" />
                    <span className="absolute top-1/2 left-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-navy transition-transform duration-500 group-open:scale-y-0" />
                  </span>
                </summary>
                <div className="pb-7 pl-[2.6rem] pr-10">
                  <p className="max-w-[40rem] leading-relaxed text-muted">{item.answer}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
