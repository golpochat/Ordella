import { LocationStatus } from '../../enums/location-status.enum';

export class LocationResponseDto {
  id!: string;
  tenantId!: string;
  storeId!: string | null;
  name!: string;
  address!: string | null;
  timezone!: string;
  status!: LocationStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
