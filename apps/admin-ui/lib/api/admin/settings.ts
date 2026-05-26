import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const locationSettingsSchema = z.record(z.unknown());

export async function getLocationSettings(api: ApiClient, locationId: string) {
  const data = await api.getData<unknown>(`admin/settings/locations/${locationId}`);
  return locationSettingsSchema.parse(data);
}

export async function updateBusinessInfo(api: ApiClient, body: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/business', body);
}

export async function getTenantLocalizationSettings(api: ApiClient) {
  return api.getData<unknown>('admin/settings/tenant');
}

export async function updateTenantLocalizationSettings(api: ApiClient, body: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/tenant', body);
}

export async function updateOpeningHours(api: ApiClient, body: Record<string, unknown>) {
  return api.post<{ success: boolean; data: unknown }>('admin/settings/opening-hours', body);
}

export async function updateDeliveryZones(api: ApiClient, body: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/delivery-zones', body);
}

export async function getDeliverySettings(api: ApiClient) {
  return api.getData<unknown>('admin/settings/delivery');
}

export async function updatePaymentSettings(api: ApiClient, body: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/payment', body);
}

export async function updatePosSettings(api: ApiClient, body: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/pos', body);
}

export async function updateDeliverySettings(
  api: ApiClient,
  body: {
    locationId?: string;
    deliveryEnabled?: boolean;
    deliveryRadiusKm?: number;
    deliveryFee?: number;
    minimumOrderAmount?: number;
    freeDeliveryThreshold?: number | null;
    deliveryZones?: Record<string, unknown>[];
    autoAssignDrivers?: boolean;
    maxActiveDeliveriesPerDriver?: number;
  },
) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/delivery', body);
}

export async function updateFulfillmentSettings(
  api: ApiClient,
  body: {
    locationId: string;
    autoAcceptOrders?: boolean;
    autoCompleteMinutes?: number | null;
    soundAlerts?: boolean;
    displayMode?: 'grid' | 'list';
    showCustomerInfo?: boolean;
  },
) {
  return api.patch<{ success: boolean; data: unknown }>('admin/settings/fulfillment', body);
}

export async function createDeliveryAssignment(
  api: ApiClient,
  body: {
    deliveryTaskId: string;
    driverProfileId: string;
    assignmentType?: 'manual' | 'auto';
  },
) {
  return api.post<{ success: boolean; data: unknown }>('delivery-assignments', body);
}
