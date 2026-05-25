import { IsBooleanString, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

/** API Spec §12.1 — shared date/location filters */
export class FilterReportDateRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsOptional()
  @IsBooleanString()
  refresh?: string;
}
