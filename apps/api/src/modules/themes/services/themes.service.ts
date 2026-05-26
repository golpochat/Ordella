import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateThemeDto, UploadThemeAssetDto } from '../dto';
import { BaseTheme, ThemeAssetEntity, ThemeEntity } from '../entities';

const BASE_THEMES: Array<{ id: BaseTheme; name: string; description: string }> = [
  { id: 'default', name: 'Default', description: 'Balanced layout for any retail storefront.' },
  { id: 'modern', name: 'Modern', description: 'Clean cards, larger hero, and strong calls to action.' },
  { id: 'minimal', name: 'Minimal', description: 'Simple spacing and subdued surfaces for focused shopping.' },
  { id: 'bold', name: 'Bold', description: 'High contrast colors and punchier presentation.' },
];

const DEFAULT_POS_THEME = {
  mode: 'light',
  primaryColor: '#0f172a',
  accentColor: '#0ea5e9',
  backgroundColor: '#ffffff',
  surfaceColor: '#f8fafc',
  textColor: '#0f172a',
  headingFont: 'Inter, system-ui, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
  density: 'comfortable',
  buttonSize: 'lg',
  cornerRadius: 'lg',
  logoUrl: null,
};

@Injectable()
export class ThemesService {
  private readonly cache = new Map<string, unknown>();

  constructor(
    @InjectRepository(ThemeEntity)
    private readonly themes: Repository<ThemeEntity>,
    @InjectRepository(ThemeAssetEntity)
    private readonly assets: Repository<ThemeAssetEntity>,
  ) {}

  baseThemes() {
    return BASE_THEMES;
  }

  async current(tenantId: string) {
    const cached = this.cache.get(tenantId);
    if (cached) return cached;

    const theme = await this.themes.findOne({
      where: { tenantId, isActive: true },
      relations: { themeAssets: true },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
    const resolved = theme ? this.toResponse(theme) : this.defaultTheme(tenantId);
    this.cache.set(tenantId, resolved);
    return resolved;
  }

  async update(tenantId: string, dto: UpdateThemeDto) {
    const existing = await this.themes.findOne({
      where: { tenantId, isActive: true },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
    const theme = existing ?? this.themes.create({ tenantId, isActive: true });

    theme.name = dto.name ?? theme.name ?? 'Storefront Theme';
    theme.baseTheme = dto.baseTheme ?? theme.baseTheme ?? 'default';
    theme.colors = { ...this.defaultColors(theme.baseTheme), ...(theme.colors ?? {}), ...(dto.colors ?? {}) };
    theme.typography = { ...this.defaultTypography(), ...(theme.typography ?? {}), ...(dto.typography ?? {}) };
    theme.layout = { ...this.defaultLayout(theme.baseTheme), ...(theme.layout ?? {}), ...(dto.layout ?? {}) };
    if (dto.preset) {
      theme.layout = { ...theme.layout, themeMode: dto.preset };
    }
    theme.layout = {
      ...theme.layout,
      posTheme: {
        ...DEFAULT_POS_THEME,
        ...((theme.layout?.posTheme as Record<string, unknown> | undefined) ?? {}),
        ...(dto.posTheme ?? {}),
      },
    };
    theme.homepageSections = dto.homepageSections ?? theme.homepageSections ?? this.defaultHomepageSections();
    theme.assets = { ...(theme.assets ?? {}), ...(dto.assets ?? {}) };
    theme.seo = { ...(theme.seo ?? {}), ...(dto.seo ?? {}) };
    theme.isActive = dto.isActive ?? true;

    const saved = await this.themes.save(theme);
    this.cache.delete(tenantId);
    return this.toResponse(saved);
  }

  async uploadAsset(tenantId: string, dto: UploadThemeAssetDto) {
    const theme = await this.ensureTheme(tenantId);
    await this.assets.save(this.assets.create({ themeId: theme.id, type: dto.type, url: dto.url }));
    const assets = { ...(theme.assets ?? {}), [dto.type]: dto.url };
    await this.themes.save({ ...theme, assets });
    this.cache.delete(tenantId);
    return this.current(tenantId);
  }

  async reset(tenantId: string) {
    await this.themes.update({ tenantId, isActive: true }, { isActive: false });
    this.cache.delete(tenantId);
    return this.defaultTheme(tenantId);
  }

  private async ensureTheme(tenantId: string): Promise<ThemeEntity> {
    const current = await this.themes.findOne({ where: { tenantId, isActive: true } });
    if (current) return current;
    return this.themes.save(this.themes.create({
      tenantId,
      name: 'Storefront Theme',
      baseTheme: 'default',
      colors: this.defaultColors('default'),
      typography: this.defaultTypography(),
      layout: this.defaultLayout('default'),
      homepageSections: this.defaultHomepageSections(),
      assets: {},
      seo: {},
      isActive: true,
    }));
  }

  private toResponse(theme: ThemeEntity) {
    const assetMap = Object.fromEntries((theme.themeAssets ?? []).map((asset) => [asset.type, asset.url]));
    return {
      id: theme.id,
      tenantId: theme.tenantId,
      name: theme.name,
      baseTheme: theme.baseTheme,
      preset: String((theme.layout?.themeMode as string | undefined) ?? 'light'),
      colors: { ...this.defaultColors(theme.baseTheme), ...(theme.colors ?? {}) },
      typography: { ...this.defaultTypography(), ...(theme.typography ?? {}) },
      layout: { ...this.defaultLayout(theme.baseTheme), ...(theme.layout ?? {}) },
      posTheme: {
        ...DEFAULT_POS_THEME,
        ...((theme.layout?.posTheme as Record<string, unknown> | undefined) ?? {}),
        logoUrl: String(
          ((theme.layout?.posTheme as Record<string, unknown> | undefined)?.logoUrl as string | null | undefined) ??
            (theme.assets ?? {}).logo ??
            assetMap.logo ??
            '',
        ) || null,
      },
      homepageSections: theme.homepageSections?.length ? theme.homepageSections : this.defaultHomepageSections(),
      assets: { ...(theme.assets ?? {}), ...assetMap },
      seo: theme.seo ?? {},
      logoUrl: String((theme.assets ?? {}).logo ?? assetMap.logo ?? '') || null,
      iconUrl: String((theme.assets ?? {}).favicon ?? assetMap.favicon ?? '') || null,
      isActive: theme.isActive,
      createdAt: theme.createdAt,
    };
  }

  private defaultTheme(tenantId: string) {
    return {
      id: 'default',
      tenantId,
      name: 'Default Storefront Theme',
      baseTheme: 'default',
      preset: 'light',
      colors: this.defaultColors('default'),
      typography: this.defaultTypography(),
      layout: this.defaultLayout('default'),
      posTheme: DEFAULT_POS_THEME,
      homepageSections: this.defaultHomepageSections(),
      assets: { logo: null, banner: null, background: null, favicon: null },
      seo: {},
      logoUrl: null,
      iconUrl: null,
      isActive: true,
      createdAt: null,
    };
  }

  private defaultColors(baseTheme: BaseTheme) {
    const palettes = {
      default: { primary: '#0f172a', secondary: '#f1f5f9', accent: '#0ea5e9', background: '#ffffff', surface: '#f8fafc', text: '#0f172a' },
      modern: { primary: '#111827', secondary: '#e0f2fe', accent: '#2563eb', background: '#ffffff', surface: '#f8fafc', text: '#111827' },
      minimal: { primary: '#27272a', secondary: '#f4f4f5', accent: '#71717a', background: '#ffffff', surface: '#fafafa', text: '#18181b' },
      bold: { primary: '#7c2d12', secondary: '#ffedd5', accent: '#f97316', background: '#fff7ed', surface: '#ffffff', text: '#1c1917' },
    } satisfies Record<BaseTheme, Record<string, string>>;
    return palettes[baseTheme];
  }

  private defaultTypography() {
    return {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      fontSizes: { sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.5rem' },
    };
  }

  private defaultLayout(baseTheme: BaseTheme) {
    return {
      cardStyle: baseTheme === 'minimal' ? 'square' : 'rounded',
      spacingScale: baseTheme === 'bold' ? 'spacious' : 'comfortable',
      buttonStyle: baseTheme === 'minimal' ? 'square' : 'rounded',
      headerLayout: 'left-aligned',
      cornerRadius: baseTheme === 'minimal' ? 'sm' : 'lg',
      layoutStyle: baseTheme === 'bold' ? 'editorial' : 'modern',
    };
  }

  private defaultHomepageSections() {
    return [
      { type: 'hero', enabled: true, title: 'Shop online', subtitle: 'Browse the catalog and choose pickup or delivery.', ctaLabel: 'Shop now' },
      { type: 'categories', enabled: true, title: 'Featured categories', limit: 4 },
      { type: 'featuredItems', enabled: true, title: 'Featured items', limit: 6 },
    ];
  }
}
