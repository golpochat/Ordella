import { DriverProfileStatus } from '../../enums/driver-profile-status.enum';

export class DriverResponseDto {
  id!: string;
  tenantId!: string;
  userId!: string | null;
  name!: string;
  phone!: string;
  status!: DriverProfileStatus;
  active!: boolean;
  vehicleType!: string | null;
  lastLat!: string | null;
  lastLng!: string | null;
  lastSeenAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
