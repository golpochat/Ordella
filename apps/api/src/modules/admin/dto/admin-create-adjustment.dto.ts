import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AdminCreateAdjustmentDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsEnum(['manual', 'correction', 'wastage'])
  kind!: 'manual' | 'correction' | 'wastage';

  @IsNumber()
  delta!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
