import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DriverProfileStatus } from '../../enums/driver-profile-status.enum';

/** API Spec §7.4 PATCH /api/v1/drivers/{id} */
export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(DriverProfileStatus)
  status?: DriverProfileStatus;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
