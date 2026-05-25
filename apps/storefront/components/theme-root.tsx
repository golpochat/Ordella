'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@shared-ui';
import { createApiClient, DEFAULT_THEME, type TenantTheme } from '@shared-utils';
import { cacheTheme, fetchThemeByTenantId, getThemeFromCache } from '@shared-utils';
import { getApiBaseUrl, getTenantId } from '@/lib/config';

type ThemeRootProps = {
  children: React.ReactNode;
};

export function ThemeRoot({ children }: ThemeRootProps) {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  useEffect(() => {
    const tenantId = getTenantId();
    if (!tenantId) return;

    const previewEnabled = new URLSearchParams(window.location.search).get('themePreview') === '1';
    const preview = previewEnabled ? window.sessionStorage.getItem('ordella.theme.preview') : null;
    if (preview) {
      try {
        setTheme(JSON.parse(preview) as TenantTheme);
        return;
      } catch {
        window.sessionStorage.removeItem('ordella.theme.preview');
      }
    }

    const cached = getThemeFromCache(tenantId);
    if (cached) setTheme(cached);

    const api = createApiClient({
      baseUrl: getApiBaseUrl(),
      getAccessToken: () => null,
      getTenantId: () => tenantId,
    });

    void fetchThemeByTenantId(api, tenantId)
      .then((resolved) => {
        cacheTheme(tenantId, resolved);
        setTheme(resolved);
      })
      .catch(() => {
        /* keep default/cached */
      });
  }, []);

  useEffect(() => {
    const faviconUrl = theme.assets?.favicon ?? theme.iconUrl;
    if (faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
    if (theme.seo?.metaTitle) {
      document.title = theme.seo.metaTitle;
    }
    if (theme.seo?.metaDescription) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = theme.seo.metaDescription;
    }
    if (theme.seo?.openGraphImage) {
      let ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = theme.seo.openGraphImage;
    }
  }, [theme.assets?.favicon, theme.iconUrl, theme.seo?.metaDescription, theme.seo?.metaTitle, theme.seo?.openGraphImage]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
