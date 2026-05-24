import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

/** API Spec §7.1 POST /api/v1/deliveries */
export class CreateDeliveryDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  driverProfileId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
