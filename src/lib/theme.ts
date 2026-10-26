import type { SettingsContent } from './content/types';

export const DEFAULT_THEME = {
  primaryColor: '#14243a',
  deepColor: '#0c1726',
  textColor: '#24282d',
  backgroundColor: '#f6f5f2',
} as const;

const HEX = /^#[0-9a-f]{6}$/i;

/** Resolved brand colours: the owner's choice where valid, otherwise the default. */
export function resolveTheme(theme: SettingsContent['theme']) {
  const pick = (key: keyof typeof DEFAULT_THEME) => (HEX.test(theme[key]) ? theme[key].toLowerCase() : DEFAULT_THEME[key]);
  return {
    primaryColor: pick('primaryColor'),
    deepColor: pick('deepColor'),
    textColor: pick('textColor'),
    backgroundColor: pick('backgroundColor'),
  };
}

/** CSS that maps the brand colours onto the design tokens. Values are validated hex codes only. */
export function themeCss(theme: SettingsContent['theme']) {
  const t = resolveTheme(theme);
  const isDefault = Object.entries(t).every(([key, value]) => value === DEFAULT_THEME[key as keyof typeof DEFAULT_THEME]);
  if (isDefault) return '';
  return `:root{--color-navy:${t.primaryColor};--color-navy-deep:${t.deepColor};--color-ink:${t.textColor};--color-paper:${t.backgroundColor};}`;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
