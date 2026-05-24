import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateOpeningHoursEntryDto } from './create-opening-hours-entry.dto';

/** API Spec §2.4 PATCH /api/v1/locations/{id}/hours */
export class UpdateLocationOpeningHoursDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHoursEntryDto)
  hours!: CreateOpeningHoursEntryDto[];
}
