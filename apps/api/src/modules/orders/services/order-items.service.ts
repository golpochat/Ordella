import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CreateOrderItemDto } from '../dto';
import { UpdateOrderItemDto } from '../dto';
import { OrderItemResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { toOrderItemResponseDto } from '../mappers/order.mapper';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { OrderTotalsService } from './order-totals.service';
import { PromotionsService } from '../integrations/promotions.service';

@Injectable()
export class OrderItemsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly orderTotalsService: OrderTotalsService,
    private readonly promotionsService: PromotionsService,
  ) {}

  async create(tenant: TenantContext, dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    const order = await this.requireEditableOrder(tenant.tenantId, dto.orderId);
    const line = await this.orderPricingService.calculateLineItem(
      tenant,
      dto.productId,
      dto.quantity,
      dto.variantId,
      dto.notes,
    );

    const item = await this.dataSource.transaction(async (manager) => {
      const created = this.orderItemRepository.create(
        {
          orderId: order.id,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          price: line.unitPrice,
          notes: line.notes,
        },
        manager,
      );
      const saved = await this.orderItemRepository.save(created, manager);
      const updatedOrder = await this.orderTotalsService.recalculateForOrder(
        tenant.tenantId,
        order.id,
        manager,
      );
      const items = await this.orderItemRepository.findByOrderId(order.id, manager);
      const draftTotals = this.orderPricingService.calculateOrderTotals(
        items.map((row) => ({
          productId: row.productId,
          variantId: row.variantId,
          quantity: row.quantity,
          unitPrice: row.price,
          lineSubtotal: (Number(row.price) * row.quantity).toFixed(2),
          notes: row.notes,
        })),
      );
      const promotionResult = await this.promotionsService.applyPromotions({
        tenant,
        order: updatedOrder,
        items,
        draftTotals,
      });
      const finalTotals = this.orderPricingService.applyDiscountToDraft(
        draftTotals,
        promotionResult.discountAmount,
        promotionResult.promotionIds,
      );
      updatedOrder.subtotal = finalTotals.subtotal;
      updatedOrder.tax = finalTotals.tax;
      updatedOrder.total = finalTotals.total;
      await this.orderRepository.save(updatedOrder, manager);
      return saved;
    });

    return toOrderItemResponseDto(item);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const existing = await this.orderItemRepository.findById(id);
    if (!existing?.order || existing.order.tenantId !== tenant.tenantId) {
      throw new NotFoundException(`Order item ${id} not found`);
    }

    await this.requireEditableOrder(tenant.tenantId, existing.orderId);

    if (dto.quantity !== undefined) {
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
    const existing = await this.orderItemRepository.findById(id);
    if (!existing?.order || existing.order.tenantId !== tenant.tenantId) {
      throw new NotFoundException(`Order item ${id} not found`);
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
    const order = await this.orderRepository.findByIdForTenant(tenantId, orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order items can only be modified while status is "${OrderStatus.PENDING}"`,
      );
    }
    return order;
  }
}
