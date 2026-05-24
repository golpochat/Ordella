import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

/** SRS §4.3 — wastage logging */
export class CreateWastageRecordDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
