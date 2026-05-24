import { IsOptional, IsUUID } from 'class-validator';

export class DriverOrderActionDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  driverId!: string;
}

export class DriverLocationUpdateDto {
  @IsUUID()
  driverId!: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}
