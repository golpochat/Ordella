import { IsArray, IsObject, IsUUID } from 'class-validator';

export class AdminUpdateDeliveryZonesDto {
  @IsUUID()
  locationId!: string;

  @IsArray()
  @IsObject({ each: true })
  zones!: Record<string, unknown>[];
}
