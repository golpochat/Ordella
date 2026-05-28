import type { TenantTheme } from './types';

function hexToHslComponents(hex: string): string | null {
  const normalized = hex.replace('#', '').trim();
  if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(normalized)) {
    return null;
  }

  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

function toCssColor(value: string): string {
  if (value.includes('%') && !value.startsWith('#')) {
    return value;
  }
  const hsl = hexToHslComponents(value);
  return hsl ?? value;
}

function contrastingForeground(hslComponents: string): string {
  const lightness = Number(hslComponents.split(' ')[2]?.replace('%', '') ?? 50);
  return lightness > 55 ? '222.2 47.4% 11.2%' : '210 40% 98%';
}

function radiusValue(value: string | undefined): string {
  const sizes = {
    none: '0rem',
    sm: '0.375rem',
    md: '0.625rem',
    lg: '1rem',
    xl: '1.5rem',
  } as const;
  return sizes[(value ?? 'lg') as keyof typeof sizes] ?? sizes.lg;
}

function posButtonHeight(value: string | undefined): string {
  const sizes = {
    sm: '2.5rem',
    md: '3rem',
    lg: '3.5rem',
  } as const;
  return sizes[(value ?? 'lg') as keyof typeof sizes] ?? sizes.lg;
}

function posDensity(value: string | undefined): { gap: string; padding: string; gridMin: string } {
  if (value === 'compact') return { gap: '0.5rem', padding: '0.75rem', gridMin: '10rem' };
  if (value === 'spacious') return { gap: '1rem', padding: '1.25rem', gridMin: '14rem' };
  return { gap: '0.75rem', padding: '1rem', gridMin: '12rem' };
}

export type ApplyThemeOptions = {
  /** When set, controls `.dark` instead of `theme.preset`. */
  colorScheme?: 'light' | 'dark';
};

export function applyThemeToElement(
  element: HTMLElement,
  theme: TenantTheme,
  options?: ApplyThemeOptions,
): void {
  const pos = theme.posTheme;
  const primary = toCssColor(theme.colors.primary);
  const secondary = toCssColor(theme.colors.secondary);
  const accent = toCssColor(theme.colors.accent ?? theme.colors.secondary);
  const background = toCssColor(theme.colors.background);
  const surface = toCssColor(theme.colors.surface);
  const text = theme.colors.text ? toCssColor(theme.colors.text) : contrastingForeground(background);

  element.style.setProperty('--primary', primary);
  element.style.setProperty('--primary-foreground', contrastingForeground(primary));
  element.style.setProperty('--secondary', secondary);
  element.style.setProperty('--secondary-foreground', contrastingForeground(secondary));
  element.style.setProperty('--background', background);
  element.style.setProperty('--foreground', text);
  element.style.setProperty('--card', surface);
  element.style.setProperty('--card-foreground', contrastingForeground(surface));
  element.style.setProperty('--muted', surface);
  element.style.setProperty('--accent', accent);
  element.style.setProperty('--accent-foreground', contrastingForeground(accent));
  element.style.setProperty('--border', secondary);
  element.style.setProperty('--input', secondary);
  element.style.setProperty('--ring', primary);
  element.style.setProperty('--surface', surface);

  element.style.setProperty('--font-size-sm', theme.typography.sm);
  element.style.setProperty('--font-size-md', theme.typography.md);
  element.style.setProperty('--font-size-lg', theme.typography.lg);
  element.style.setProperty('--font-heading', theme.typography.headingFont ?? 'Inter, system-ui, sans-serif');
  element.style.setProperty('--font-body', theme.typography.bodyFont ?? 'Inter, system-ui, sans-serif');
  const fallbackRadius = theme.layout?.cardStyle === 'square' ? 'sm' : 'lg';
  const radius = radiusValue(theme.layout?.cornerRadius ?? fallbackRadius);
  const spacing = theme.layout?.spacingScale === 'compact' ? '0.75rem' : theme.layout?.spacingScale === 'spacious' ? '1.5rem' : '1rem';
  const density = posDensity(pos?.density);
  element.style.setProperty('--theme-card-radius', radius);
  element.style.setProperty('--theme-spacing', spacing);
  element.style.setProperty('--radius', radius);
  element.style.setProperty('--storefront-radius', radius);
  element.style.setProperty('--storefront-spacing', spacing);
  element.style.setProperty('--storefront-section-padding', theme.layout?.spacingScale === 'compact' ? '2.5rem' : theme.layout?.spacingScale === 'spacious' ? '5rem' : '3.5rem');
  element.style.setProperty('--storefront-card-padding', theme.layout?.spacingScale === 'compact' ? '1rem' : theme.layout?.spacingScale === 'spacious' ? '1.75rem' : '1.25rem');
  element.style.setProperty('--storefront-container', theme.layout?.layoutStyle === 'editorial' ? '72rem' : '80rem');
  element.style.setProperty('--pos-radius', radiusValue(pos?.cornerRadius));
  element.style.setProperty('--pos-button-height', posButtonHeight(pos?.buttonSize));
  element.style.setProperty('--pos-density-gap', density.gap);
  element.style.setProperty('--pos-panel-padding', density.padding);
  element.style.setProperty('--pos-grid-min', density.gridMin);
  const posPrimary = toCssColor(pos?.primaryColor ?? theme.colors.primary);
  const posAccent = toCssColor(pos?.accentColor ?? theme.colors.accent ?? theme.colors.secondary);
  element.style.setProperty('--pos-brand', posPrimary);
  element.style.setProperty('--pos-brand-foreground', contrastingForeground(posPrimary));
  element.style.setProperty('--pos-accent', posAccent);

  const scheme = options?.colorScheme ?? (theme.preset === 'dark' ? 'dark' : 'light');
  element.classList.toggle('dark', scheme === 'dark');
  element.dataset.odsColorScheme = scheme;
}
