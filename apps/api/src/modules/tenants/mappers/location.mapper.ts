import { LocationOpeningHoursEntity } from '../entities/location-opening-hours.entity';
import { LocationEntity } from '../entities/location.entity';
import { LocationStatus } from '../enums/location-status.enum';
import { LocationDetailResponseDto } from '../dto/locations/location-detail-response.dto';
import { LocationListItemResponseDto } from '../dto/locations/location-list-item-response.dto';
import { LocationResponseDto } from '../dto/locations/location-response.dto';

export function locationIsActive(status: LocationStatus): boolean {
  return status === LocationStatus.OPEN || status === LocationStatus.BUSY;
}

export function toLocationResponseDto(location: LocationEntity): LocationResponseDto {
  return {
    id: location.id,
    tenantId: location.tenantId,
    storeId: location.storeId,
    name: location.name,
    address: location.address,
    timezone: location.timezone,
    status: location.status,
    fulfillmentMode: location.fulfillmentMode,
    deliveryZones: location.deliveryZones ?? [],
    routingPriority: location.routingPriority,
    fulfillmentCapacity: location.fulfillmentCapacity,
    supportsDelivery: location.supportsDelivery,
    supportsPickup: location.supportsPickup,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  };
}

export function toLocationListItemDto(
  location: LocationEntity,
  settings: Record<string, unknown>,
  meta: { staffCount: number; lowStockCount: number; totalStockItems: number },
): LocationListItemResponseDto {
  const base = toLocationResponseDto(location);
  return {
    ...base,
    phone: (settings.phone as string) ?? '',
    currency: (settings.currency as string) ?? 'EUR',
    slug: (settings.slug as string) ?? null,
    isActive: locationIsActive(location.status),
    staffCount: meta.staffCount,
    lowStockCount: meta.lowStockCount,
    totalStockItems: meta.totalStockItems,
    inventoryStatus:
      meta.lowStockCount > 0 ? 'low_stock' : meta.totalStockItems > 0 ? 'ok' : 'empty',
  };
}

export function toLocationDetailDto(
  location: LocationEntity,
  settings: Record<string, unknown>,
  openingHours: LocationOpeningHoursEntity[],
  meta: { staffCount: number; lowStockCount: number; totalStockItems: number },
): LocationDetailResponseDto {
  const list = toLocationListItemDto(location, settings, meta);
  return {
    ...list,
    fulfillmentSettings: (settings.fulfillment as Record<string, unknown>) ?? {},
    deliverySettings: (settings.deliverySettings as Record<string, unknown>) ?? {},
    fulfillmentDisplay: (settings.fulfillmentDisplay as Record<string, unknown>) ?? {},
    deliveryZones: (settings.deliveryZones as unknown[]) ?? [],
    openingHours: openingHours.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      openTime: row.openTime,
      closeTime: row.closeTime,
      isClosed: row.isClosed,
    })),
    settings,
  };
}

export function slugifyLocationName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'location';
}
