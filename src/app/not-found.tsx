import Link from 'next/link';
import { LogoMark } from '@/components/brand/Logo';
import { buttonClass } from '@/components/site/Button';

export default function NotFound() {
  return (
    <main className="blueprint flex min-h-svh items-center">
      <div className="shell">
        <LogoMark className="h-12" alt="Dedicated Security Management B.V." />
        <p className="eyebrow mt-10">Fout 404</p>
        <h1 className="display-lg mt-6 max-w-[16ch] text-navy">
          Deze pagina bestaat <span className="accent">niet (meer).</span>
        </h1>
        <p className="mt-6 max-w-[32rem] text-[1.05rem] leading-relaxed text-muted">
          Controleer het adres of ga terug naar de homepage. Bekijk ook ons overzicht van diensten.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass('primary')}>
            Naar de homepage
          </Link>
          <Link href="/diensten" className={buttonClass('secondary')}>
            Onze diensten
          </Link>
        </div>
      </div>
    </main>
  );
}
