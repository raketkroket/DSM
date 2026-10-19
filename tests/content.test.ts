import { describe, expect, it } from 'vitest';
import { defaultContent } from '@/lib/content/defaults';
import { mergeSection, mergeSite, mergeWithDefault } from '@/lib/content/merge';
import { isAllowedImageSrc, isSafeHref, sanitizeSection } from '@/lib/content/sanitize';
import { SERVICE_SLUGS } from '@/lib/content/services';

describe('content defaults', () => {
  it('ships all nine services from the client document', () => {
    expect(SERVICE_SLUGS).toEqual([
      'bouwplaatsbeveiliging',
      'evenementenbeveiliging',
      'receptiediensten',
      'recreatiebeveiliging',
      'objectbewaking',
      'winkelsurveillance',
      'cameratoezicht',
      'beveiliging-op-maat',
      'veiligheidskundigen-en-risicoanalyses',
    ]);
  });

  it('uses the approved hero headline and keeps contact details empty', () => {
    expect(`${defaultContent.home.hero.title} ${defaultContent.home.hero.titleAccent}`).toBe('Uw veiligheid, onze verantwoordelijkheid.');
    expect(defaultContent.settings.email).toBe('');
    expect(defaultContent.settings.phone).toBe('');
  });

  it('keeps the RI&E qualification from the document', () => {
    const risk = defaultContent.services.items.find((item) => item.slug === 'veiligheidskundigen-en-risicoanalyses');
    expect(risk?.activities.some((line) => line.includes('indien de benodigde deskundigheid aanwezig is'))).toBe(true);
  });
});

describe('mergeWithDefault', () => {
  it('falls back to defaults for missing or mistyped values', () => {
    const result = mergeWithDefault({ title: 'A', count: 1, list: ['x'] }, { title: 42, list: 'nope' });
    expect(result).toEqual({ title: 'A', count: 1, list: ['x'] });
  });

  it('accepts stored values of the right type, including arrays of objects', () => {
    const result = mergeWithDefault({ items: [{ a: '', b: '' }] }, { items: [{ a: '1' }, { a: '2', b: '3' }] });
    expect(result).toEqual({ items: [{ a: '1', b: '' }, { a: '2', b: '3' }] });
  });

  it('keeps optional string keys such as image focus points', () => {
    const result = mergeWithDefault({ src: '', alt: '' }, { src: 'x', alt: 'y', focus: '20% 30%' });
    expect(result).toEqual({ src: 'x', alt: 'y', focus: '20% 30%' });
  });
});

describe('mergeSection("services")', () => {
  it('locks slugs and order to the fixed URLs while taking edited copy', () => {
    const merged = mergeSection('services', {
      title: 'Nieuw',
      items: [
        { slug: 'cameratoezicht', title: 'Camerabewaking' },
        { slug: 'onbekend', title: 'Mag niet verschijnen' },
      ],
    });
    expect(merged.title).toBe('Nieuw');
    expect(merged.items.map((item) => item.slug)).toEqual(SERVICE_SLUGS);
    expect(merged.items.find((item) => item.slug === 'cameratoezicht')?.title).toBe('Camerabewaking');
    expect(merged.items.some((item) => item.title === 'Mag niet verschijnen')).toBe(false);
  });

  it('returns the full default site when nothing is stored', () => {
    expect(mergeSite({})).toEqual(defaultContent);
  });
});

describe('sanitizeSection', () => {
  it('rejects images from unknown hosts and unsafe links', () => {
    const input = structuredClone(defaultContent.home);
    input.hero.image = { src: 'https://evil.example/x.jpg', alt: 'x' };
    input.hero.primaryCta = { label: 'Klik', href: 'javascript:alert(1)' };
    const { data, problems } = sanitizeSection('home', input);
    expect(data.hero.image.src).toBe('');
    expect(data.hero.primaryCta.href).toBe('/');
    expect(problems.length).toBe(2);
  });

  it('validates e-mail addresses and social links in settings', () => {
    const { data, problems } = sanitizeSection('settings', {
      ...defaultContent.settings,
      email: 'geen-adres',
      notificationEmail: 'info@example.nl',
      linkedin: 'http://linkedin.com/x',
    });
    expect(data.email).toBe('');
    expect(data.notificationEmail).toBe('info@example.nl');
    expect(data.linkedin).toBe('');
    expect(problems).toHaveLength(2);
  });

  it('drops malformed focus points', () => {
    const input = structuredClone(defaultContent.contact);
    input.hero.image = { ...input.hero.image, focus: 'url(evil)' };
    expect(sanitizeSection('contact', input).data.hero.image.focus).toBe('');
  });
});

describe('url helpers', () => {
  it('only allows internal, https, mailto and tel links', () => {
    expect(isSafeHref('/offerte')).toBe(true);
    expect(isSafeHref('https://example.nl')).toBe(true);
    expect(isSafeHref('mailto:a@b.nl')).toBe(true);
    expect(isSafeHref('//evil.example')).toBe(false);
    expect(isSafeHref('http://example.nl')).toBe(false);
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
  });

  it('only allows configured image hosts over https', () => {
    expect(isAllowedImageSrc('https://images.unsplash.com/photo-1')).toBe(true);
    expect(isAllowedImageSrc('http://images.unsplash.com/photo-1')).toBe(false);
    expect(isAllowedImageSrc('')).toBe(true);
  });
});
