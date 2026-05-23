import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class OpeningHoursEntryDto {
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

/** API Spec §2.4 PATCH /api/v1/locations/{id}/hours */
export class UpdateLocationOpeningHoursDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursEntryDto)
  hours!: OpeningHoursEntryDto[];
}

export class LocationOpeningHoursResponseDto {
  locationId!: string;
  hours!: OpeningHoursEntryDto[];
}
