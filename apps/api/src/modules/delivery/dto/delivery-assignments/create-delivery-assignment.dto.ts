import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DeliveryAssignmentType } from '../../enums/delivery-assignment-type.enum';

export class CreateDeliveryAssignmentDto {
  @IsUUID()
  deliveryTaskId!: string;

  @IsUUID()
  driverProfileId!: string;

  @IsOptional()
  @IsEnum(DeliveryAssignmentType)
  assignmentType?: DeliveryAssignmentType;
}
