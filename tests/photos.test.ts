import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { photoSlots } from '@/lib/admin/photo-slots';
import { defaultContent } from '@/lib/content/defaults';
import { PHOTO_CREDITS, STOCK_PREFIX, isTemporaryPhoto, photos } from '@/lib/content/photos';
import { isAllowedImageSrc, sanitizeSection } from '@/lib/content/sanitize';

describe('temporary photography', () => {
  it('ships every referenced stock file and keeps a credit for each', () => {
    for (const image of Object.values(photos)) {
      const file = image.src.slice(STOCK_PREFIX.length).replace(/\.jpg$/, '');
      expect(PHOTO_CREDITS[file], file).toBeDefined();
      expect(existsSync(join(process.cwd(), 'public', image.src)), image.src).toBe(true);
    }
  });

  it('only credits Pexels and Unsplash photo pages', () => {
    for (const credit of Object.values(PHOTO_CREDITS)) {
      expect(credit.page).toMatch(/^https:\/\/(www\.pexels\.com\/photo|unsplash\.com\/photos)\//);
    }
  });

  it('accepts bundled images but not path tricks', () => {
    expect(isAllowedImageSrc('/images/stock/hero-earpiece.jpg')).toBe(true);
    expect(isAllowedImageSrc('/images/../secret.jpg')).toBe(false);
    expect(isAllowedImageSrc('/api/offerte.jpg')).toBe(false);
  });

  it('keeps stock paths when content is sanitised', () => {
    expect(sanitizeSection('home', defaultContent.home).data.hero.image.src).toBe(photos.heroEarpiece.src);
  });
});

describe('photo slots', () => {
  const slots = photoSlots(defaultContent);

  it('finds every image slot in the default content and marks stock photos as temporary', () => {
    expect(slots.length).toBeGreaterThan(30);
    expect(slots.filter((slot) => slot.image.src).every((slot) => slot.temporary === isTemporaryPhoto(slot.image.src))).toBe(true);
  });

  it('labels slots the way the editor does', () => {
    expect(slots.map((slot) => slot.label)).toContain('Homepagina › Hero › Hero-foto');
    expect(slots.some((slot) => slot.label.startsWith('Diensten › Dienstpagina’s › Cameratoezicht'))).toBe(true);
  });

  it('points at real paths inside the content', () => {
    const hero = slots.find((slot) => slot.label === 'Homepagina › Hero › Hero-foto')!;
    expect(hero.section).toBe('home');
    expect(hero.path).toEqual(['hero', 'image']);
  });
});
