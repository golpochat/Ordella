import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class AdminUpdateDeliverySettingsDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryRadiusKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number | null;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  deliveryZones?: Record<string, unknown>[];

  @IsOptional()
  @IsBoolean()
  autoAssignDrivers?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxActiveDeliveriesPerDriver?: number;
}
