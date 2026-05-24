import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export class DeliveryResponseDto {
  id!: string;
  tenantId!: string;
  orderId!: string;
  driverProfileId!: string | null;
  status!: DeliveryTaskStatus;
  eta!: Date | null;
  deliveryFee!: string | null;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
