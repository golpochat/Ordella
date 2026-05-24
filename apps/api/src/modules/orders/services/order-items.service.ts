import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CreateOrderItemDto } from '../dto';
import { UpdateOrderItemDto } from '../dto';
import { OrderItemResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { assertValidLineQuantity } from '../domain/order-lifecycle.validation';
import { throwOrderItemNotFound, throwOrderNotEditable } from '../domain/order-domain.errors';
import { toOrderItemResponseDto } from '../mappers/order.mapper';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { OrderTotalsService } from './order-totals.service';
import { OrderAccessService } from './order-access.service';

@Injectable()
export class OrderItemsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderAccessService: OrderAccessService,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly orderTotalsService: OrderTotalsService,
  ) {}

  async create(tenant: TenantContext, dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    assertValidLineQuantity(dto.quantity);

    const order = await this.requireEditableOrder(tenant.tenantId, dto.orderId);
    const pricingContext = this.orderPricingService.buildPricingContext(
      tenant,
      order.locationId,
      order.orderType,
    );

    const line = await this.orderPricingService.calculateLineItem(
      tenant,
      {
        productId: dto.productId,
        quantity: dto.quantity,
        variantId: dto.variantId,
        modifierOptionIds: dto.modifierOptionIds,
        notes: dto.notes,
      },
      pricingContext,
    );

    const item = await this.dataSource.transaction(async (manager) => {
      const created = this.orderItemRepository.create(
        {
          orderId: order.id,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          price: line.unitPriceWithModifiers,
          notes: line.notes,
        },
        manager,
      );
      const saved = await this.orderItemRepository.save(created, manager);
      await this.orderTotalsService.recalculateForOrder(tenant.tenantId, order.id, manager);
      return saved;
    });

    return toOrderItemResponseDto(item);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const existing = await this.orderItemRepository.findByIdForTenant(tenant.tenantId, id);
    if (!existing) {
      throwOrderItemNotFound(id);
    }

    await this.requireEditableOrder(tenant.tenantId, existing.orderId);

    if (dto.quantity !== undefined) {
      assertValidLineQuantity(dto.quantity);
      existing.quantity = dto.quantity;
    }
    if (dto.notes !== undefined) {
      existing.notes = dto.notes;
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      const updated = await this.orderItemRepository.save(existing, manager);
      await this.orderTotalsService.recalculateForOrder(
        tenant.tenantId,
        existing.orderId,
        manager,
      );
      return updated;
    });

    return toOrderItemResponseDto(saved);
  }

  async remove(tenant: TenantContext, id: string): Promise<void> {
    const existing = await this.orderItemRepository.findByIdForTenant(tenant.tenantId, id);
    if (!existing) {
      throwOrderItemNotFound(id);
    }

    await this.requireEditableOrder(tenant.tenantId, existing.orderId);

    await this.dataSource.transaction(async (manager) => {
      await this.orderItemRepository.remove(existing, manager);
      await this.orderTotalsService.recalculateForOrder(
        tenant.tenantId,
        existing.orderId,
        manager,
      );
    });
  }

  private async requireEditableOrder(tenantId: string, orderId: string) {
    const order = await this.orderAccessService.requireOrder(tenantId, orderId);
    if (order.status !== OrderStatus.PENDING) {
      throwOrderNotEditable(order.status);
    }
    return order;
  }
}
