import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export class DeliveryStatusHistoryResponseDto {
  id!: string;
  deliveryTaskId!: string;
  fromStatus!: DeliveryTaskStatus | null;
  toStatus!: DeliveryTaskStatus;
  changedBy!: string | null;
  reason!: string | null;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
}
