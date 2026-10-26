import type { SectionKey } from '@/lib/content/types';

export type FieldSpec =
  | { type: 'text' | 'textarea' | 'email' | 'url'; key: string; label: string; help?: string; rows?: number }
  | { type: 'image'; key: string; label: string; help?: string }
  | { type: 'cta'; key: string; label: string; help?: string }
  | { type: 'group'; key: string; label: string; help?: string; fields: FieldSpec[] }
  | {
      type: 'list';
      key: string;
      label: string;
      help?: string;
      itemLabel: string;
      /** Field(s) for each item. A single unnamed field means the list holds plain values. */
      item: FieldSpec[] | { type: 'text' | 'textarea' | 'image' };
      fixed?: boolean;
      titleKey?: string;
    };

/** A top-level panel in the editor (one per page area). */
export type PanelSpec = { key: string | null; label: string; help?: string; fields: FieldSpec[] };

export const SECTION_META: Record<SectionKey, { label: string; description: string; preview: string }> = {
  home: { label: 'Homepagina', description: 'Hero, introductie, filosofie, lagen, werkwijze, sectoren en afsluiting.', preview: '' },
  services: { label: 'Diensten', description: 'Overzichtspagina en de negen dienstpagina’s.', preview: 'diensten' },
  about: { label: 'Over ons', description: 'Verhaal, ontwikkeling, expertise, missie en visie, galerij.', preview: 'over-ons' },
  faq: { label: 'Veelgestelde vragen', description: 'Vragen en antwoorden op home, diensten en contact.', preview: '' },
  contact: { label: 'Contact & offerte', description: 'Contactpagina, offerteformulier en bevestiging.', preview: 'contact' },
  settings: { label: 'Website-instellingen', description: 'Contactgegevens, sociale media, logo, footer en SEO.', preview: '' },
};

const t = (key: string, label: string, help?: string): FieldSpec => ({ type: 'text', key, label, help });
const ta = (key: string, label: string, rows = 4, help?: string): FieldSpec => ({ type: 'textarea', key, label, rows, help });
const img = (key: string, label: string, help?: string): FieldSpec => ({ type: 'image', key, label, help });
const paragraphs = (key = 'paragraphs', label = 'Alinea’s'): FieldSpec => ({ type: 'list', key, label, itemLabel: 'Alinea', item: { type: 'textarea' } });
const bullets = (key: string, label: string, itemLabel = 'Punt'): FieldSpec => ({ type: 'list', key, label, itemLabel, item: { type: 'text' } });

export const EDITOR_SPEC: Record<SectionKey, PanelSpec[]> = {
  home: [
    {
      key: 'hero',
      label: 'Hero',
      help: 'Het eerste wat bezoekers zien.',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop (eerste regel)'),
        t('titleAccent', 'Kop (accentregel)', 'Wordt in het cursieve accentlettertype getoond.'),
        ta('lead', 'Introductie', 3),
        ta('body', 'Toelichting onder de hero', 4),
        { type: 'cta', key: 'primaryCta', label: 'Primaire knop' },
        { type: 'cta', key: 'secondaryCta', label: 'Secundaire knop' },
        img('image', 'Hero-foto', 'Liggende foto, minimaal 2400 pixels breed.'),
        t('caption', 'Bijschrift op de foto'),
      ],
    },
    {
      key: 'experience',
      label: 'Gebouwd op ervaring',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        t('titleAccent', 'Kop (accent)'),
        paragraphs(),
        { type: 'list', key: 'milestones', label: 'Ontwikkelingsfasen', itemLabel: 'Fase', titleKey: 'title', item: [t('label', 'Label'), t('title', 'Titel'), ta('text', 'Tekst', 3)] },
        img('imagePrimary', 'Hoofdfoto (staand)'),
        img('imageSecondary', 'Detailfoto'),
      ],
    },
    {
      key: 'philosophy',
      label: 'Meer dan aanwezigheid',
      fields: [t('eyebrow', 'Bovenregel'), ta('statement', 'Statement', 2), paragraphs(), bullets('principles', 'Uitgangspunten', 'Uitgangspunt'), img('image', 'Brede foto')],
    },
    {
      key: 'why',
      label: 'Waarom DSM',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        ta('text', 'Introductie', 3),
        { type: 'list', key: 'items', label: 'Onderscheidende punten', itemLabel: 'Punt', titleKey: 'title', item: [t('title', 'Titel'), ta('text', 'Tekst', 3)] },
        img('image', 'Foto'),
      ],
    },
    { key: 'servicesIntro', label: 'Diensten-introductie', fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop'), ta('text', 'Tekst', 3)] },
    {
      key: 'layers',
      label: 'Beveiliging in lagen',
      help: 'De interactieve visualisatie toont drie lagen: mensen, eigendommen en processen.',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        ta('text', 'Tekst', 3),
        { type: 'list', key: 'items', label: 'Lagen', itemLabel: 'Laag', titleKey: 'title', fixed: true, item: [t('title', 'Naam'), ta('summary', 'Samenvatting', 2), bullets('points', 'Aandachtspunten')] },
      ],
    },
    {
      key: 'process',
      label: 'Werkwijze',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        ta('text', 'Tekst', 3),
        { type: 'list', key: 'steps', label: 'Stappen', itemLabel: 'Stap', titleKey: 'title', item: [t('title', 'Titel'), ta('text', 'Tekst', 4)] },
      ],
    },
    {
      key: 'sectors',
      label: 'Sectoren',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        ta('text', 'Tekst', 2),
        { type: 'list', key: 'items', label: 'Sectoren', itemLabel: 'Sector', titleKey: 'title', item: [t('title', 'Naam'), ta('text', 'Tekst', 2), img('image', 'Foto')] },
      ],
    },
    {
      key: 'bespoke',
      label: 'Beveiliging op maat',
      fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop'), paragraphs(), bullets('factors', 'Waar wij naar kijken', 'Factor'), ta('closing', 'Afsluitende zin', 2), img('image', 'Foto')],
    },
    {
      key: 'closing',
      label: 'Afsluiting',
      fields: [t('title', 'Kop'), paragraphs(), { type: 'cta', key: 'primaryCta', label: 'Primaire knop' }, { type: 'cta', key: 'secondaryCta', label: 'Secundaire knop' }, img('image', 'Achtergrondfoto')],
    },
  ],

  services: [
    { key: null, label: 'Overzichtspagina', fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop'), t('titleAccent', 'Kop (accent)'), ta('intro', 'Introductie', 4)] },
    {
      key: null,
      label: 'Dienstpagina’s',
      help: 'De negen diensten hebben vaste webadressen. Alle teksten en foto’s zijn aanpasbaar.',
      fields: [
        {
          type: 'list',
          key: 'items',
          label: 'Diensten',
          itemLabel: 'Dienst',
          titleKey: 'title',
          fixed: true,
          item: [
            t('title', 'Naam'),
            t('shortTitle', 'Korte naam', 'Gebruikt in het kruimelpad en knoppen.'),
            t('tagline', 'Ondertitel'),
            ta('summary', 'Samenvatting', 3, 'Wordt getoond in overzichten.'),
            paragraphs('intro', 'Introductie'),
            t('activitiesTitle', 'Kop werkzaamheden'),
            bullets('activities', 'Werkzaamheden', 'Werkzaamheid'),
            t('audienceTitle', 'Kop doelgroep'),
            ta('audience', 'Doelgroep', 2),
            bullets('importance', 'Waarom het ertoe doet'),
            ta('note', 'Opmerking (optioneel)', 2, 'Bijvoorbeeld een privacy- of kwalificatievoorbehoud.'),
            img('image', 'Hoofdfoto'),
            img('detailImage', 'Detailfoto'),
            t('seoTitle', 'SEO-titel'),
            ta('seoDescription', 'SEO-omschrijving', 2, 'Maximaal circa 155 tekens.'),
          ],
        },
      ],
    },
  ],

  about: [
    { key: 'hero', label: 'Hero', fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop'), t('titleAccent', 'Kop (accent)'), ta('lead', 'Introductie', 3), img('image', 'Foto')] },
    { key: 'intro', label: 'Introductie', fields: [ta('title', 'Statement', 2), paragraphs()] },
    {
      key: 'origin',
      label: 'Ontwikkeling',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        { type: 'list', key: 'chapters', label: 'Hoofdstukken', itemLabel: 'Hoofdstuk', titleKey: 'title', item: [t('label', 'Label'), t('title', 'Titel'), ta('text', 'Tekst', 4)] },
        img('image', 'Foto'),
      ],
    },
    {
      key: 'expertise',
      label: 'Expertise',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        paragraphs(),
        { type: 'list', key: 'areas', label: 'Expertisegebieden', itemLabel: 'Gebied', titleKey: 'title', item: [t('title', 'Titel'), ta('text', 'Tekst', 2)] },
        img('image', 'Foto'),
      ],
    },
    { key: 'mission', label: 'Missie', fields: [t('title', 'Kop'), paragraphs()] },
    { key: 'vision', label: 'Visie', fields: [t('title', 'Kop'), paragraphs()] },
    { key: 'values', label: 'Visie op veiligheid', fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop', 'Woorden gescheiden door een punt worden los getoond.'), paragraphs(), ta('statement', 'Citaat', 2)] },
    { key: 'future', label: 'Toekomst', fields: [t('title', 'Kop'), paragraphs()] },
    { key: null, label: 'Galerij', help: 'Sleep of verplaats foto’s om de volgorde te bepalen.', fields: [{ type: 'list', key: 'gallery', label: 'Galerijfoto’s', itemLabel: 'Foto', item: { type: 'image' } }] },
    { key: 'closing', label: 'Afsluiting', fields: [t('title', 'Kop'), ta('text', 'Tekst', 3), { type: 'cta', key: 'cta', label: 'Knop' }] },
  ],

  faq: [
    {
      key: null,
      label: 'Veelgestelde vragen',
      fields: [
        t('eyebrow', 'Bovenregel'),
        t('title', 'Kop'),
        { type: 'list', key: 'items', label: 'Vragen', itemLabel: 'Vraag', titleKey: 'question', item: [t('question', 'Vraag'), ta('answer', 'Antwoord', 4)] },
      ],
    },
  ],

  contact: [
    { key: 'hero', label: 'Contactpagina', fields: [t('eyebrow', 'Bovenregel'), t('title', 'Kop'), t('titleAccent', 'Kop (accent)'), ta('lead', 'Introductie', 3), img('image', 'Foto')] },
    { key: null, label: 'Formulieren', fields: [t('formTitle', 'Kop contactformulier'), ta('formIntro', 'Introductie contactformulier', 2), t('quoteTitle', 'Kop offerte'), ta('quoteIntro', 'Introductie offerte', 3), img('quoteImage', 'Achtergrondfoto offertepagina')] },
    { key: null, label: 'Bevestiging en privacy', fields: [t('confirmationTitle', 'Titel bevestiging'), ta('confirmationText', 'Tekst bevestiging', 3), ta('privacyNote', 'Toestemmingstekst bij formulieren', 2)] },
  ],

  settings: [
    {
      key: null,
      label: 'Bedrijfsgegevens',
      help: 'Lege velden worden niet getoond op de website.',
      fields: [t('companyName', 'Bedrijfsnaam'), t('tagline', 'Slogan'), { type: 'email', key: 'email', label: 'E-mailadres' }, t('phone', 'Telefoonnummer'), t('address', 'Adres'), t('postalCity', 'Postcode en plaats'), t('kvk', 'KvK-nummer')],
    },
    {
      key: null,
      label: 'Meldingen',
      fields: [{ type: 'email', key: 'notificationEmail', label: 'E-mailadres voor nieuwe aanvragen', help: 'Nieuwe offerteaanvragen en berichten worden naar dit adres gestuurd.' }],
    },
    { key: null, label: 'Sociale media', fields: [{ type: 'url', key: 'linkedin', label: 'LinkedIn' }, { type: 'url', key: 'instagram', label: 'Instagram' }, { type: 'url', key: 'facebook', label: 'Facebook' }] },
    { key: null, label: 'Logo en footer', fields: [img('logo', 'Logo', 'Laat leeg om het standaard woordmerk te gebruiken. Gebruik bij voorkeur een liggend logo.'), ta('footerText', 'Footertekst', 2)] },
    {
      key: null,
      label: 'SEO',
      fields: [t('seoTitle', 'Standaard paginatitel'), ta('seoDescription', 'Standaard omschrijving', 3, 'Maximaal circa 155 tekens.'), img('ogImage', 'Deelafbeelding (1200 × 630)', 'Wordt getoond wanneer de website wordt gedeeld.')],
    },
  ],
};
