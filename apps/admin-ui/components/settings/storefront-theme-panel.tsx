'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
} from '@shared-ui';
import { DEFAULT_THEME, type BaseTheme, type HomepageSection, type TenantTheme } from '@shared-utils';
import {
  fetchBaseThemes,
  fetchCurrentTheme,
  resetStorefrontTheme,
  updateStorefrontTheme,
  uploadThemeAsset,
  type BaseThemeOption,
  type ThemeAssetType,
} from '@/lib/api/themes';
import { getErrorMessage } from '@/lib/utils';

const COLOR_KEYS = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'] as const;
const FONT_SIZE_KEYS = ['sm', 'md', 'lg'] as const;
const ASSET_KEYS: ThemeAssetType[] = ['logo', 'banner', 'favicon'];

function ThemePreview({ theme }: { theme: TenantTheme }) {
  const hero = theme.homepageSections?.find((section) => section.type === 'hero');

  return (
    <ThemeProvider theme={theme}>
      <Card className="overflow-hidden rounded-[var(--theme-card-radius)] border-dashed bg-background">
        {theme.assets?.banner ? (
          <img src={theme.assets.banner} alt="" className="max-h-48 w-full object-cover" />
        ) : null}
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{theme.name ?? 'Storefront Theme'}</CardTitle>
              <p className="text-sm text-muted-foreground">{theme.baseTheme ?? 'default'} base theme</p>
            </div>
            <Badge>{theme.layout?.cardStyle ?? 'rounded'} cards</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[var(--theme-card-radius)] bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Preview</p>
            <h3 className="mt-1 text-2xl font-semibold">{hero?.title ?? 'Shop online'}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {hero?.subtitle ?? 'Browse the catalog and choose pickup or delivery.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Primary action</Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}

export function StorefrontThemePanel() {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);
  const [baseThemes, setBaseThemes] = useState<BaseThemeOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sections = useMemo(() => theme.homepageSections ?? DEFAULT_THEME.homepageSections ?? [], [theme.homepageSections]);
  const hero = sections.find((section) => section.type === 'hero');
  const categories = sections.find((section) => section.type === 'categories');
  const featuredItems = sections.find((section) => section.type === 'featuredItems');
  const banner = sections.find((section) => section.type === 'banner');

  useEffect(() => {
    void Promise.all([fetchCurrentTheme(), fetchBaseThemes()])
      .then(([current, options]) => {
        setTheme(current);
        setBaseThemes(options);
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  async function save(patch: Partial<TenantTheme>) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateStorefrontTheme({
        name: patch.name ?? theme.name,
        baseTheme: patch.baseTheme ?? theme.baseTheme,
        colors: { ...theme.colors, ...(patch.colors ?? {}) },
        typography: { ...theme.typography, ...(patch.typography ?? {}) },
        layout: { ...(theme.layout ?? {}), ...(patch.layout ?? {}) },
        homepageSections: patch.homepageSections ?? theme.homepageSections,
        assets: { ...(theme.assets ?? {}), ...(patch.assets ?? {}) },
        seo: { ...(theme.seo ?? {}), ...(patch.seo ?? {}) },
      });
      setTheme(updated);
      setMessage('Theme saved');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function updateSection(type: HomepageSection['type'], patch: Partial<HomepageSection>) {
    const current = sections.length ? sections : DEFAULT_THEME.homepageSections ?? [];
    const next = current.some((section) => section.type === type)
      ? current.map((section) => (section.type === type ? { ...section, ...patch } : section))
      : [...current, { type, enabled: true, ...patch }];
    setTheme({ ...theme, homepageSections: next });
  }

  async function saveAsset(type: ThemeAssetType, url: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await uploadThemeAsset(type, url);
      setTheme(updated);
      setMessage('Asset updated');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function resetTheme() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      setTheme(await resetStorefrontTheme());
      setMessage('Theme reset');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Storefront Theme</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control colors, typography, layout, assets, homepage sections, and SEO.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={resetTheme} disabled={loading}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="colors">
            <TabsList>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="assets">Assets & SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Theme name</label>
                  <Input
                    value={theme.name ?? ''}
                    onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                    onBlur={() => void save({ name: theme.name })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Base theme</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={theme.baseTheme ?? 'default'}
                    onChange={(e) => void save({ baseTheme: e.target.value as BaseTheme })}
                  >
                    {baseThemes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {COLOR_KEYS.map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium capitalize">{key}</label>
                    <Input
                      type="color"
                      value={(theme.colors[key] ?? '#000000').startsWith('#') ? theme.colors[key] ?? '#000000' : '#000000'}
                      onChange={(e) => void save({ colors: { ...theme.colors, [key]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="typography" className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Heading font</label>
                  <Input
                    value={theme.typography.headingFont ?? ''}
                    onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, headingFont: e.target.value } })}
                    onBlur={() => void save({ typography: theme.typography })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Body font</label>
                  <Input
                    value={theme.typography.bodyFont ?? ''}
                    onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, bodyFont: e.target.value } })}
                    onBlur={() => void save({ typography: theme.typography })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {FONT_SIZE_KEYS.map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium">Font {key}</label>
                    <Input
                      value={theme.typography[key]}
                      onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, [key]: e.target.value } })}
                      onBlur={() => void save({ typography: theme.typography })}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="layout" className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['cardStyle', 'Card style', ['rounded', 'square']],
                ['spacingScale', 'Spacing scale', ['compact', 'comfortable', 'spacious']],
                ['buttonStyle', 'Button style', ['rounded', 'square', 'pill']],
                ['headerLayout', 'Header layout', ['left-aligned', 'centered']],
              ].map(([key, label, options]) => (
                <div key={key as string} className="space-y-1">
                  <label className="text-sm font-medium">{label as string}</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={(theme.layout?.[key as keyof NonNullable<TenantTheme['layout']>] as string | undefined) ?? ''}
                    onChange={(e) => void save({ layout: { ...(theme.layout ?? {}), [key as string]: e.target.value } })}
                  >
                    {(options as string[]).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="homepage" className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Hero title"
                  value={hero?.title ?? ''}
                  onChange={(e) => updateSection('hero', { title: e.target.value })}
                />
                <Input
                  placeholder="Hero CTA label"
                  value={hero?.ctaLabel ?? ''}
                  onChange={(e) => updateSection('hero', { ctaLabel: e.target.value })}
                />
              </div>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm"
                placeholder="Hero subtitle"
                value={hero?.subtitle ?? ''}
                onChange={(e) => updateSection('hero', { subtitle: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Categories title"
                  value={categories?.title ?? ''}
                  onChange={(e) => updateSection('categories', { title: e.target.value })}
                />
                <Input
                  placeholder="Featured products title"
                  value={featuredItems?.title ?? ''}
                  onChange={(e) => updateSection('featuredItems', { title: e.target.value })}
                />
                <Input
                  placeholder="Promo banner title"
                  value={banner?.title ?? ''}
                  onChange={(e) => updateSection('banner', { title: e.target.value, enabled: Boolean(e.target.value) })}
                />
              </div>
              <Button type="button" onClick={() => void save({ homepageSections: sections })} disabled={loading}>
                Save homepage
              </Button>
            </TabsContent>

            <TabsContent value="assets" className="mt-4 space-y-4">
              <div className="grid gap-3">
                {ASSET_KEYS.map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium capitalize">{key === 'favicon' ? 'Favicon' : key}</label>
                    <Input
                      value={theme.assets?.[key] ?? ''}
                      onChange={(e) => setTheme({ ...theme, assets: { ...(theme.assets ?? {}), [key]: e.target.value || null } })}
                      onBlur={() => {
                        const url = theme.assets?.[key];
                        if (url) void saveAsset(key, url);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Meta title"
                  value={theme.seo?.metaTitle ?? ''}
                  onChange={(e) => setTheme({ ...theme, seo: { ...(theme.seo ?? {}), metaTitle: e.target.value } })}
                  onBlur={() => void save({ seo: theme.seo })}
                />
                <Input
                  placeholder="OpenGraph image URL"
                  value={theme.seo?.openGraphImage ?? ''}
                  onChange={(e) => setTheme({ ...theme, seo: { ...(theme.seo ?? {}), openGraphImage: e.target.value || null } })}
                  onBlur={() => void save({ seo: theme.seo })}
                />
              </div>
              <textarea
                className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm"
                placeholder="Meta description"
                value={theme.seo?.metaDescription ?? ''}
                onChange={(e) => setTheme({ ...theme, seo: { ...(theme.seo ?? {}), metaDescription: e.target.value } })}
                onBlur={() => void save({ seo: theme.seo })}
              />
            </TabsContent>
          </Tabs>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading ? <p className="text-sm text-muted-foreground">Saving…</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <ThemePreview theme={theme} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Preview uses the same theme tokens as the storefront. Theme preview mode is available on the storefront with <code>?themePreview=1</code>.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.sessionStorage.setItem('ordella.theme.preview', JSON.stringify(theme));
                setMessage('Preview theme stored for this browser session');
              }}
            >
              Prepare preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
