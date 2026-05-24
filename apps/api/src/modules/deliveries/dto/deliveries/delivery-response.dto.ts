import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export class DeliveryResponseDto {
  id!: string;
  tenantId!: string;
  orderId!: string;
  driverId!: string | null;
  status!: DeliveryTaskStatus;
  eta!: Date | null;
  startedAt!: Date | null;
  completedAt!: Date | null;
  metadata!: Record<string, unknown>;
  deliveryFee!: string | null;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
