import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AdminUpdateDeliverySettingsDto {
  @IsUUID()
  locationId!: string;

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
  freeDeliveryThreshold?: number;

  @IsOptional()
  @IsBoolean()
  autoAssignDrivers?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxActiveDeliveriesPerDriver?: number;
}
