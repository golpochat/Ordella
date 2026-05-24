import type { PosCatalogCategory, PosCatalogItem } from '@/lib/api';

const CATALOG_KEY = 'ordella.pos.catalog';

export type CachedCatalog = {
  categories: PosCatalogCategory[];
  items: PosCatalogItem[];
  cachedAt: string;
};

export function saveCatalogCache(catalog: CachedCatalog): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

export function loadCatalogCache(): CachedCatalog | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CATALOG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedCatalog;
  } catch {
    return null;
  }
}
