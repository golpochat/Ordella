import { Injectable } from '@nestjs/common';
import { DeliveryTaskRepository } from '../../deliveries/repositories/delivery-task.repository';
import { DriverProfileRepository } from '../../deliveries/repositories/driver-profile.repository';
import {
  labelDriverDisplayStatus,
  mapDriverDisplayStatus,
} from '../../deliveries/mappers/driver-display-status.mapper';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderType } from '../../orders/enums/order-type.enum';

export type KdsDriverInfo = {
  driverStatus: string | null;
  driverStatusLabel: string | null;
  driverName: string | null;
};

@Injectable()
export class KdsDeliveryEnrichmentService {
  constructor(
    private readonly taskRepository: DeliveryTaskRepository,
    private readonly driverRepository: DriverProfileRepository,
  ) {}

  async buildDriverInfoMap(
    tenantId: string,
    orders: OrderEntity[],
  ): Promise<Map<string, KdsDriverInfo>> {
    const deliveryOrders = orders.filter(
      (o) => o.orderType === OrderType.DELIVERY || o.orderType === OrderType.PICKUP,
    );
    if (!deliveryOrders.length) {
      return new Map();
    }

    const tasks = await this.taskRepository.findByOrderIds(
      tenantId,
      deliveryOrders.map((o) => o.id),
    );

    const driverIds = [...new Set(tasks.map((t) => t.driverId).filter(Boolean))] as string[];
    const driverNames = new Map<string, string>();
    for (const driverId of driverIds) {
      const driver = await this.driverRepository.findByIdForTenant(tenantId, driverId);
      if (driver) {
        driverNames.set(driverId, driver.name);
      }
    }

    const result = new Map<string, KdsDriverInfo>();
    for (const task of tasks) {
      const display = mapDriverDisplayStatus(task.status, Boolean(task.driverId));
      result.set(task.orderId, {
        driverStatus: display,
        driverStatusLabel: labelDriverDisplayStatus(display),
        driverName: task.driverId ? driverNames.get(task.driverId) ?? null : null,
      });
    }
    return result;
  }
}
