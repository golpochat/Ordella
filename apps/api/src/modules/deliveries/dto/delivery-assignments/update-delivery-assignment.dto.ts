import { IsEnum, IsOptional } from 'class-validator';
import { DeliveryAssignmentStatus } from '../../enums/delivery-assignment-status.enum';

export class UpdateDeliveryAssignmentDto {
  @IsOptional()
  @IsEnum(DeliveryAssignmentStatus)
  status?: DeliveryAssignmentStatus;
}
