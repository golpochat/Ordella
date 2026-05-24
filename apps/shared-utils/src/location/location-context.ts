export type LocationOption = {
  id: string;
  name: string;
  slug?: string | null;
};

const STORAGE_KEY = 'ordella.locationId';

export function getStoredLocationId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredLocationId(locationId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, locationId);
}

export function clearStoredLocationId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export function resolveActiveLocationId(
  locations: LocationOption[],
  preferred?: string | null,
): string | null {
  if (locations.length === 0) {
    return null;
  }
  if (preferred && locations.some((loc) => loc.id === preferred)) {
    return preferred;
  }
  const stored = getStoredLocationId();
  if (stored && locations.some((loc) => loc.id === stored)) {
    return stored;
  }
  return locations[0]?.id ?? null;
}
