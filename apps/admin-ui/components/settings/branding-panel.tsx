'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useEffect, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Logo, ThemeProvider, useTheme } from '@shared-ui';
import { DEFAULT_THEME, type TenantTheme, type ThemePreset } from '@shared-utils';
import { fetchTenantTheme, updateTenantIcon, updateTenantLogo, updateTenantTheme } from '@/lib/api/branding';
import { getErrorMessage } from '@/lib/utils';
import { InlineLoader } from '@/components/ui/admin-loader';

const PRESETS: ThemePreset[] = ['light', 'dark', 'custom'];

function BrandingPreview() {
  const theme = useTheme();

  return (
    <Card className="border-dashed bg-surface">
      <CardHeader>
        <CardTitle className="text-base">Live preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt="Logo" className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <Logo variant="mark" size="md" color="auto" />
          )}
          <div>
            <p className="font-semibold">Your storefront</p>
            <p className="text-sm text-muted-foreground">Preset: {theme.preset}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary action</Button>
          <Button size="sm" variant="neutral">
            Secondary
          </Button>
          <Tag><TagLabel>Status</TagLabel></Tag>
        </div>
        <Card>
          <CardContent className="p-3 text-sm">Product card preview with themed surface.</CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function BrandingPanel() {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchTenantTheme()
      .then(setTheme)
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  async function saveTheme(patch: Partial<TenantTheme>) {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTenantTheme({
        preset: patch.preset ?? theme.preset,
        colors: { ...theme.colors, ...(patch.colors ?? {}) },
        typography: { ...theme.typography, ...(patch.typography ?? {}) },
        iconUrl: patch.iconUrl ?? theme.iconUrl,
      });
      setTheme(updated);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Theme preset</label>
              <Select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={theme.preset}
                onChange={(e) => void saveTheme({ preset: e.target.value as ThemePreset })}
              >
                {PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(['primary', 'secondary', 'background', 'surface'] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium capitalize">{key}</label>
                  <Input
                    type="color"
                    value={theme.colors[key].startsWith('#') ? theme.colors[key] : '#000000'}
                    onChange={(e) =>
                      void saveTheme({ colors: { ...theme.colors, [key]: e.target.value } })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(['sm', 'md', 'lg'] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">Font {key}</label>
                  <Input
                    value={theme.typography[key]}
                    onChange={(e) =>
                      setTheme({ ...theme, typography: { ...theme.typography, [key]: e.target.value } })
                    }
                    onBlur={() => void saveTheme({ typography: theme.typography })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Logo URL (placeholder upload)</label>
              <Input
                value={theme.logoUrl ?? ''}
                onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value || null })}
                onBlur={async () => {
                  if (!theme.logoUrl) return;
                  setLoading(true);
                  try {
                    setTheme(await updateTenantLogo(theme.logoUrl));
                  } catch (e) {
                    setError(getErrorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Icon URL (placeholder upload)</label>
              <Input
                value={theme.iconUrl ?? ''}
                onChange={(e) => setTheme({ ...theme, iconUrl: e.target.value || null })}
                onBlur={async () => {
                  if (!theme.iconUrl) return;
                  setLoading(true);
                  try {
                    setTheme(await updateTenantIcon(theme.iconUrl));
                  } catch (e) {
                    setError(getErrorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>

            {error ? <FormErrorAlert message={error} /> : null}
            {loading ? <InlineLoader label="Saving…" size="sm" /> : null}
          </CardContent>
        </Card>

        <BrandingPreview />
      </div>
    </ThemeProvider>
  );
}
