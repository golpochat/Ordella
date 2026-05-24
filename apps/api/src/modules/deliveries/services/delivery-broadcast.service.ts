import { Injectable } from '@nestjs/common';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';
import { toDeliveryResponseDto } from '../mappers/delivery-task.mapper';
import { DeliveriesGateway } from '../gateways/deliveries.gateway';

@Injectable()
export class DeliveryBroadcastService {
  constructor(private readonly gateway: DeliveriesGateway) {}

  taskAssigned(tenantId: string, task: DeliveryTaskEntity, driverId: string): void {
    const payload = { ...toDeliveryResponseDto(task), driverId };
    this.gateway.broadcastToDriver(tenantId, driverId, 'task.assigned', payload);
    this.gateway.broadcastToTenant(tenantId, 'task.updated', payload);
  }

  taskUpdated(tenantId: string, task: DeliveryTaskEntity): void {
    const payload = toDeliveryResponseDto(task);
    if (task.driverId) {
      this.gateway.broadcastToDriver(tenantId, task.driverId, 'task.updated', payload);
    }
    this.gateway.broadcastToTenant(tenantId, 'task.updated', payload);
  }

  taskCancelled(tenantId: string, task: DeliveryTaskEntity): void {
    const payload = toDeliveryResponseDto(task);
    if (task.driverId) {
      this.gateway.broadcastToDriver(tenantId, task.driverId, 'task.cancelled', payload);
    }
    this.gateway.broadcastToTenant(tenantId, 'task.cancelled', payload);
  }
}
