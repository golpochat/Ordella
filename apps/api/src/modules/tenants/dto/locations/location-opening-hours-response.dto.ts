import { CreateOpeningHoursEntryDto } from './create-opening-hours-entry.dto';

export class LocationOpeningHoursResponseDto {
  locationId!: string;
  hours!: CreateOpeningHoursEntryDto[];
}
