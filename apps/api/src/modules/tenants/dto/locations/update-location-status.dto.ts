import { IsEnum } from 'class-validator';
import { LocationStatus } from '../../enums/location-status.enum';

/** API Spec §2.5 PATCH /api/v1/locations/{id}/status */
export class UpdateLocationStatusDto {
  @IsEnum(LocationStatus)
  status!: LocationStatus;
}
