import { LocationListItemResponseDto } from './location-list-item-response.dto';

export class LocationDetailResponseDto extends LocationListItemResponseDto {
  fulfillmentSettings!: Record<string, unknown>;
  deliverySettings!: Record<string, unknown>;
  fulfillmentDisplay!: Record<string, unknown>;
  deliveryZones!: unknown[];
  openingHours!: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
  settings!: Record<string, unknown>;
}
