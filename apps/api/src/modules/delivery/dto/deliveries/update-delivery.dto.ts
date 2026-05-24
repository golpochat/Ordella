import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

/** API Spec §7.1 PATCH /api/v1/deliveries/{id} */
export class UpdateDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryTaskStatus)
  status?: DeliveryTaskStatus;

  @IsOptional()
  @IsUUID()
  driverProfileId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
