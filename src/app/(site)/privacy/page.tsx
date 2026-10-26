import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { getPublishedSite } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: 'Hoe Dedicated Security Management B.V. omgaat met gegevens die via deze website worden verstrekt.',
  alternates: { canonical: '/privacy' },
};

/**
 * Describes what this website technically does with personal data. The owner should have
 * this text reviewed before launch; it intentionally makes no claims beyond the implementation.
 */
export default async function PrivacyPage() {
  const { settings } = await getPublishedSite();
  const contactLine = [settings.email, settings.phone].filter(Boolean).join(' of ');
  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-36">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Privacyverklaring' }]} />
          <h1 className="display-md mt-8 text-navy">Privacyverklaring</h1>
        </div>
        <div className="space-y-10 text-[1.02rem] leading-relaxed text-muted lg:col-span-7 lg:col-start-6">
          <div>
            <h2 className="text-[1.3rem] font-medium tracking-[-0.02em] text-navy">Welke gegevens wij ontvangen</h2>
            <p className="mt-3">
              Wanneer u het contactformulier of het offerteformulier invult, ontvangt {settings.companyName} de gegevens die u daarin opgeeft:
              naam, bedrijfsnaam, e-mailadres, telefoonnummer, de gewenste dienst, de locatie van de opdracht en uw omschrijving.
            </p>
          </div>
          <div>
            <h2 className="text-[1.3rem] font-medium tracking-[-0.02em] text-navy">Waarvoor wij deze gegevens gebruiken</h2>
            <p className="mt-3">
              Wij gebruiken uw gegevens uitsluitend om uw aanvraag of vraag te behandelen en om contact met u op te nemen. U ontvangt
              daarnaast een bevestiging van uw aanvraag per e-mail.
            </p>
          </div>
          <div>
            <h2 className="text-[1.3rem] font-medium tracking-[-0.02em] text-navy">Opslag en beveiliging</h2>
            <p className="mt-3">
              Uw aanvraag wordt niet op de website bewaard, maar via een beveiligde verbinding per e-mail naar ons verstuurd (met de
              e-maildienst Resend). Ter bescherming tegen misbruik wordt een onomkeerbaar versleutelde (gehashte) afgeleide van uw
              IP-adres maximaal een dag tijdelijk bijgehouden, zodat herhaalde verzendingen kunnen worden beperkt. Het IP-adres zelf
              wordt niet opgeslagen.
            </p>
          </div>
          <div>
            <h2 className="text-[1.3rem] font-medium tracking-[-0.02em] text-navy">Cookies</h2>
            <p className="mt-3">
              Deze website plaatst geen tracking- of advertentiecookies. Alleen het beheergedeelte gebruikt functionele cookies om
              ingelogde beheerders te herkennen.
            </p>
          </div>
          <div>
            <h2 className="text-[1.3rem] font-medium tracking-[-0.02em] text-navy">Uw rechten</h2>
            <p className="mt-3">
              U kunt ons vragen om uw gegevens in te zien, te corrigeren of te verwijderen
              {contactLine ? ` via ${contactLine}` : ' via het contactformulier'}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
