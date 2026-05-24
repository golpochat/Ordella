import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { throwOrderNotFound } from '../domain/order-domain.errors';
import { assertOrderTenantScope } from '../domain/order-lifecycle.validation';
import { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class OrderAccessService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async requireOrder(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findByIdForTenant(tenantId, orderId, manager);
    if (!order) {
      throwOrderNotFound(orderId);
    }
    return order;
  }

  async requireOrderWithItems(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findByIdWithItems(tenantId, orderId, manager);
    if (!order) {
      throwOrderNotFound(orderId);
    }
    assertOrderTenantScope(order, tenantId);
    return order;
  }

  assertOrderBelongsToTenant(order: OrderEntity, tenantId: string): void {
    assertOrderTenantScope(order, tenantId);
  }
}
