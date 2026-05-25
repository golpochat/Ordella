import { LocationStatus } from '../../enums/location-status.enum';
import { FulfillmentMode } from '../../entities/location.entity';

export class LocationResponseDto {
  id!: string;
  tenantId!: string;
  storeId!: string | null;
  name!: string;
  address!: string | null;
  timezone!: string;
  status!: LocationStatus;
  fulfillmentMode!: FulfillmentMode;
  createdAt!: Date;
  updatedAt!: Date;
}
