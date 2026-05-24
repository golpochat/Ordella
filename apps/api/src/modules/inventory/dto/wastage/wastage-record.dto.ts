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

export class WastageRecordResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  locationId!: string;
  quantity!: string;
  reason!: string | null;
  recordedBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
