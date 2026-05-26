import { IsArray, IsObject, IsOptional, IsUUID } from 'class-validator';

export class AdminUpdateDeliveryZonesDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsArray()
  @IsObject({ each: true })
  zones!: Record<string, unknown>[];
}
