import { DeliveryAssignmentStatus } from '../../enums/delivery-assignment-status.enum';
import { DeliveryAssignmentType } from '../../enums/delivery-assignment-type.enum';

export class DeliveryAssignmentResponseDto {
  id!: string;
  deliveryTaskId!: string;
  driverProfileId!: string;
  assignmentType!: DeliveryAssignmentType;
  status!: DeliveryAssignmentStatus;
  assignedAt!: Date;
  acceptedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
