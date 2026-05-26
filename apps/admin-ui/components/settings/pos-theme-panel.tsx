'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, ThemeProvider } from '@shared-ui';
import { DEFAULT_THEME, type PosTheme, type TenantTheme } from '@shared-utils';
import { fetchCurrentTheme, updateStorefrontTheme } from '@/lib/api/themes';
import { getErrorMessage } from '@/lib/utils';

const DEFAULT_POS_THEME = DEFAULT_THEME.posTheme!;

const COLOR_FIELDS: Array<{ key: keyof Pick<PosTheme, 'primaryColor' | 'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textColor'>; label: string }> = [
  { key: 'primaryColor', label: 'Brand color' },
  { key: 'accentColor', label: 'Accent color' },
  { key: 'backgroundColor', label: 'Background' },
  { key: 'surfaceColor', label: 'Surface' },
  { key: 'textColor', label: 'Text' },
];

function mergePosTheme(posTheme?: Partial<PosTheme> | null): PosTheme {
  return { ...DEFAULT_POS_THEME, ...(posTheme ?? {}) };
}

function PosPreview({ theme, posTheme }: { theme: TenantTheme; posTheme: PosTheme }) {
  const previewTheme = useMemo<TenantTheme>(
    () => ({
      ...theme,
      preset: posTheme.mode,
      colors: {
        ...theme.colors,
        primary: posTheme.primaryColor,
        accent: posTheme.accentColor,
        background: posTheme.backgroundColor,
        surface: posTheme.surfaceColor,
        text: posTheme.textColor,
      },
      typography: {
        ...theme.typography,
        headingFont: posTheme.headingFont,
        bodyFont: posTheme.bodyFont,
      },
      posTheme,
      logoUrl: posTheme.logoUrl ?? theme.logoUrl,
    }),
    [posTheme, theme],
  );

  return (
    <ThemeProvider theme={previewTheme}>
      <div className="overflow-hidden rounded-[var(--pos-radius)] border bg-background text-foreground">
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-3">
            {posTheme.logoUrl ? (
              <img src={posTheme.logoUrl} alt="" className="h-9 w-9 rounded-[var(--pos-radius)] bg-background object-contain p-1" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--pos-radius)] bg-background text-sm font-bold text-foreground">
                O
              </div>
            )}
            <div>
              <p className="text-sm opacity-80">POS Register</p>
              <p className="font-semibold">Brand preview</p>
            </div>
          </div>
          <span className="rounded-full bg-background/20 px-3 py-1 text-xs">Online</span>
        </div>
        <div className="grid gap-[var(--pos-density-gap)] p-[var(--pos-panel-padding)] md:grid-cols-[1fr_14rem]">
          <div className="grid grid-cols-2 gap-[var(--pos-density-gap)]">
            {['Espresso', 'Flat white', 'Breakfast roll', 'Fresh juice'].map((item) => (
              <div key={item} className="rounded-[var(--pos-radius)] border bg-card p-[var(--pos-panel-padding)] shadow-sm">
                <p className="font-semibold">{item}</p>
                <p className="text-sm text-muted-foreground">Tap to add</p>
                <Button type="button" className="mt-3 h-[var(--pos-button-height)] w-full">
                  Add
                </Button>
              </div>
            ))}
          </div>
          <div className="rounded-[var(--pos-radius)] border bg-card p-[var(--pos-panel-padding)]">
            <p className="font-semibold">Cart</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Flat white</span>
                <span>€4.20</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT</span>
                <span>€0.79</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span>€4.20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export function PosThemePanel() {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);
  const [posTheme, setPosTheme] = useState<PosTheme>(DEFAULT_POS_THEME);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentTheme()
      .then((current) => {
        setTheme(current);
        setPosTheme(mergePosTheme(current.posTheme));
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  function patchPosTheme(patch: Partial<PosTheme>) {
    setPosTheme((current) => ({ ...current, ...patch }));
  }

  async function save() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateStorefrontTheme({
        colors: {
          ...theme.colors,
          primary: posTheme.primaryColor,
          accent: posTheme.accentColor,
          background: posTheme.backgroundColor,
          surface: posTheme.surfaceColor,
          text: posTheme.textColor,
        },
        typography: {
          ...theme.typography,
          headingFont: posTheme.headingFont,
          bodyFont: posTheme.bodyFont,
        },
        posTheme,
        assets: { ...(theme.assets ?? {}), logo: posTheme.logoUrl ?? null },
      });
      setTheme(updated);
      setPosTheme(mergePosTheme(updated.posTheme));
      setMessage('POS theme saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">POS Theme & Branding</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize the register header, light or dark mode, product grid density, controls, typography, and rounded corners.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mode</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={posTheme.mode}
                onChange={(event) => patchPosTheme({ mode: event.target.value as PosTheme['mode'] })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Logo URL</label>
              <Input value={posTheme.logoUrl ?? ''} onChange={(event) => patchPosTheme({ logoUrl: event.target.value || null })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium">{field.label}</label>
                <Input type="color" value={posTheme[field.key]} onChange={(event) => patchPosTheme({ [field.key]: event.target.value })} />
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Heading font</label>
              <Input value={posTheme.headingFont} onChange={(event) => patchPosTheme({ headingFont: event.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Body font</label>
              <Input value={posTheme.bodyFont} onChange={(event) => patchPosTheme({ bodyFont: event.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Layout density</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={posTheme.density}
                onChange={(event) => patchPosTheme({ density: event.target.value as PosTheme['density'] })}
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Button size</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={posTheme.buttonSize}
                onChange={(event) => patchPosTheme({ buttonSize: event.target.value as PosTheme['buttonSize'] })}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Corner radius</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={posTheme.cornerRadius}
                onChange={(event) => patchPosTheme({ cornerRadius: event.target.value as PosTheme['cornerRadius'] })}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra large</option>
              </select>
            </div>
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" onClick={save} disabled={loading}>
            Save POS theme
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Live preview</h3>
        <PosPreview theme={theme} posTheme={posTheme} />
      </div>
    </div>
  );
}

