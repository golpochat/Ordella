import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DriverProfileStatus } from '../../enums/driver-profile-status.enum';

/** API Spec §7.4 POST /api/v1/drivers */
export class CreateDriverDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(DriverProfileStatus)
  status?: DriverProfileStatus;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
