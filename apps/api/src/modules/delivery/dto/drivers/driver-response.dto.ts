import { DriverProfileStatus } from '../../enums/driver-profile-status.enum';

export class DriverResponseDto {
  id!: string;
  tenantId!: string;
  userId!: string | null;
  name!: string;
  phone!: string;
  status!: DriverProfileStatus;
  vehicleType!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
