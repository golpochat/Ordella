import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class AdminOpeningHoursEntryDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class AdminUpdateOpeningHoursDto {
  @IsUUID()
  locationId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminOpeningHoursEntryDto)
  entries!: AdminOpeningHoursEntryDto[];
}
