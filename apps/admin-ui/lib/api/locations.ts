import { createBrowserApiClient } from './browser';

export type LocationListItem = {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  timezone: string;
  status: string;
  fulfillmentMode?: 'storefront' | 'pos' | 'dark_store' | 'micro_fulfillment';
  locationType?: 'store' | 'warehouse' | 'dark_store' | 'distribution_center';
  phone: string;
  currency: string;
  slug: string | null;
  isActive: boolean;
  staffCount: number;
  lowStockCount: number;
  totalStockItems: number;
  inventoryStatus: 'ok' | 'low_stock' | 'empty';
};

export type LocationDetail = LocationListItem & {
  fulfillmentSettings: Record<string, unknown>;
  deliverySettings: Record<string, unknown>;
  fulfillmentDisplay: Record<string, unknown>;
  deliveryZones: unknown[];
  openingHours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
  settings: Record<string, unknown>;
};

export type LocationStaffMember = {
  userId: string;
  name: string;
  email: string;
  roleName: string | null;
  assigned: boolean;
};

export async function fetchLocations(): Promise<LocationListItem[]> {
  const api = createBrowserApiClient();
  return api.getData<LocationListItem[]>('locations/list');
}

export async function fetchLocation(id: string): Promise<LocationDetail> {
  const api = createBrowserApiClient();
  return api.getData<LocationDetail>(`locations/${id}`);
}

export async function createLocation(body: {
  name: string;
  address?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  status?: string;
}): Promise<LocationDetail> {
  const api = createBrowserApiClient();
  return api.postData<LocationDetail>('locations/create', body);
}

export async function updateLocation(
  id: string,
  body: Partial<{
    name: string;
    address: string;
    phone: string;
    timezone: string;
    currency: string;
    status: string;
  }>,
): Promise<LocationDetail> {
  const api = createBrowserApiClient();
  const res = await api.patch<{ success: boolean; data: LocationDetail }>(
    `locations/${id}`,
    body,
  );
  return res.data;
}

export async function disableLocation(id: string): Promise<void> {
  const api = createBrowserApiClient();
  await api.patch(`locations/${id}/status`, { status: 'closed' });
}

export async function updateLocationSettings(
  id: string,
  settings: Record<string, unknown>,
): Promise<void> {
  const api = createBrowserApiClient();
  await api.patch(`locations/${id}/settings`, { settings });
}

export async function updateLocationHours(
  id: string,
  hours: Array<{
    dayOfWeek: number;
    openTime?: string | null;
    closeTime?: string | null;
    isClosed?: boolean;
  }>,
): Promise<void> {
  const api = createBrowserApiClient();
  await api.patch(`locations/${id}/hours`, { hours });
}

export async function fetchLocationStaff(locationId: string): Promise<LocationStaffMember[]> {
  const api = createBrowserApiClient();
  return api.getData<LocationStaffMember[]>(`locations/${locationId}/staff`);
}

export async function assignLocationStaff(
  locationId: string,
  userIds: string[],
): Promise<void> {
  const api = createBrowserApiClient();
  await api.put(`locations/${locationId}/staff`, { userIds });
}
