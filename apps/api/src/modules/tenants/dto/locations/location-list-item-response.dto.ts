import { LocationResponseDto } from './location-response.dto';

export class LocationListItemResponseDto extends LocationResponseDto {
  phone!: string;
  currency!: string;
  slug!: string | null;
  isActive!: boolean;
  staffCount!: number;
  lowStockCount!: number;
  totalStockItems!: number;
  inventoryStatus!: 'ok' | 'low_stock' | 'empty';
}
