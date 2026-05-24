import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/** API Spec §12.1 — shared date/location filters */
export class ReportDateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}
