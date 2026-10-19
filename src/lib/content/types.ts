export type ImageRef = {
  src: string;
  alt: string;
  /** Optional focal point used for object-position, e.g. "50% 30%". */
  focus?: string;
};

export type Cta = { label: string; href: string };

export type SettingsContent = {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  postalCity: string;
  kvk: string;
  notificationEmail: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  logo: ImageRef;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: ImageRef;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lead: string;
    body: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    image: ImageRef;
    caption: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    paragraphs: string[];
    milestones: { label: string; title: string; text: string }[];
    imagePrimary: ImageRef;
    imageSecondary: ImageRef;
  };
  philosophy: {
    eyebrow: string;
    statement: string;
    paragraphs: string[];
    principles: string[];
    image: ImageRef;
  };
  servicesIntro: { eyebrow: string; title: string; text: string };
  layers: {
    eyebrow: string;
    title: string;
    text: string;
    items: { title: string; summary: string; points: string[] }[];
  };
  process: {
    eyebrow: string;
    title: string;
    text: string;
    steps: { title: string; text: string }[];
  };
  sectors: {
    eyebrow: string;
    title: string;
    text: string;
    items: { title: string; text: string; image: ImageRef }[];
  };
  bespoke: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    factors: string[];
    closing: string;
    image: ImageRef;
  };
  closing: {
    title: string;
    paragraphs: string[];
    primaryCta: Cta;
    secondaryCta: Cta;
    image: ImageRef;
  };
};

export type ServiceContent = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  summary: string;
  intro: string[];
  activitiesTitle: string;
  activities: string[];
  audienceTitle: string;
  audience: string;
  importance: string[];
  note: string;
  image: ImageRef;
  detailImage: ImageRef;
  seoTitle: string;
  seoDescription: string;
};

export type ServicesContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  intro: string;
  items: ServiceContent[];
};

export type AboutContent = {
  hero: { eyebrow: string; title: string; titleAccent: string; lead: string; image: ImageRef };
  intro: { title: string; paragraphs: string[] };
  origin: {
    eyebrow: string;
    title: string;
    chapters: { label: string; title: string; text: string }[];
    image: ImageRef;
  };
  expertise: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    areas: { title: string; text: string }[];
    image: ImageRef;
  };
  mission: { title: string; paragraphs: string[] };
  vision: { title: string; paragraphs: string[] };
  values: { eyebrow: string; title: string; paragraphs: string[]; statement: string };
  future: { title: string; paragraphs: string[] };
  gallery: ImageRef[];
  closing: { title: string; text: string; cta: Cta };
};

export type FaqContent = {
  eyebrow: string;
  title: string;
  items: { question: string; answer: string }[];
};

export type ContactContent = {
  hero: { eyebrow: string; title: string; titleAccent: string; lead: string; image: ImageRef };
  formTitle: string;
  formIntro: string;
  quoteTitle: string;
  quoteIntro: string;
  quoteImage: ImageRef;
  confirmationTitle: string;
  confirmationText: string;
  privacyNote: string;
};

export type SiteContent = {
  settings: SettingsContent;
  home: HomeContent;
  services: ServicesContent;
  about: AboutContent;
  faq: FaqContent;
  contact: ContactContent;
};

export type SectionKey = keyof SiteContent;

export const SECTION_KEYS: SectionKey[] = ['home', 'services', 'about', 'faq', 'contact', 'settings'];
