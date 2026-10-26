import { ImageReveal } from '@/components/motion/ImageReveal';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { DrawLine } from '@/components/motion/DrawLine';
import { Photo } from '@/components/site/Photo';
import type { HomeContent } from '@/lib/content/types';

/** Differentiators as an editorial list beside a tall, sticky portrait photograph. */
export function WhyDsm({ why }: { why: HomeContent['why'] }) {
  return (
    <section aria-labelledby="waarom-titel" className="bg-white py-24 md:py-36">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <ImageReveal parallax={6} className="aspect-[4/5] bg-mist">
              <Photo image={why.image} sizes="(min-width: 1024px) 38vw, 92vw" />
            </ImageReveal>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="eyebrow">{why.eyebrow}</p>
            <h2 id="waarom-titel" className="display-md mt-6 text-navy">
              {why.title}
            </h2>
            <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted">{why.text}</p>
          </Reveal>
          <RevealGroup as="ol" className="mt-14">
            {why.items.map((item, index) => (
              <RevealItem as="li" key={item.title} className="relative">
                <DrawLine />
                <div className="grid grid-cols-[3rem_1fr] gap-4 py-8 md:grid-cols-[4.5rem_1fr]">
                  <span className="font-display text-[1.6rem] leading-none font-medium tracking-[-0.03em] text-steel tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[1.35rem] font-medium tracking-[-0.02em] text-navy md:text-[1.55rem]">{item.title}</h3>
                    <p className="mt-3 max-w-[32rem] text-[1rem] leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <DrawLine />
        </div>
      </div>
    </section>
  );
}
