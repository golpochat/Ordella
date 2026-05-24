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

export function applyThemeToElement(element: HTMLElement, theme: TenantTheme): void {
  const primary = toCssColor(theme.colors.primary);
  const secondary = toCssColor(theme.colors.secondary);
  const background = toCssColor(theme.colors.background);
  const surface = toCssColor(theme.colors.surface);

  element.style.setProperty('--primary', primary);
  element.style.setProperty('--primary-foreground', contrastingForeground(primary));
  element.style.setProperty('--secondary', secondary);
  element.style.setProperty('--secondary-foreground', contrastingForeground(secondary));
  element.style.setProperty('--background', background);
  element.style.setProperty('--foreground', contrastingForeground(background));
  element.style.setProperty('--card', surface);
  element.style.setProperty('--card-foreground', contrastingForeground(surface));
  element.style.setProperty('--muted', surface);
  element.style.setProperty('--accent', secondary);
  element.style.setProperty('--accent-foreground', contrastingForeground(secondary));
  element.style.setProperty('--border', secondary);
  element.style.setProperty('--input', secondary);
  element.style.setProperty('--ring', primary);
  element.style.setProperty('--surface', surface);

  element.style.setProperty('--font-size-sm', theme.typography.sm);
  element.style.setProperty('--font-size-md', theme.typography.md);
  element.style.setProperty('--font-size-lg', theme.typography.lg);

  element.classList.toggle('dark', theme.preset === 'dark');
}
