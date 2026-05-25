import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatusHistoryEntity } from '../entities/order-status-history.entity';
import { OrderEventEntity } from '../entities/order-event.entity';
import { OrderResponseDto } from '../dto/orders/order-response.dto';
import { OrderItemResponseDto } from '../dto/order-items/order-item-response.dto';
import { OrderStatusHistoryResponseDto } from '../dto/order-status-history/order-status-history-response.dto';
import { OrderEventResponseDto } from '../dto/order-events/order-event-response.dto';
import { OrderTaxLineEntity } from '../../tax/entities/order-tax-line.entity';

export function toOrderTaxLineResponseDto(entity: OrderTaxLineEntity) {
  return {
    id: entity.id,
    taxName: entity.taxName,
    taxType: entity.taxType,
    priceMode: entity.priceMode,
    taxRate: entity.taxRate,
    taxableAmount: entity.taxableAmount,
    taxAmount: entity.taxAmount,
    jurisdiction: entity.jurisdiction,
    taxRuleId: entity.taxRuleId,
    taxCategoryId: entity.taxCategoryId,
    orderItemId: entity.orderItemId,
  };
}

export function toOrderItemResponseDto(entity: OrderItemEntity): OrderItemResponseDto {
  return {
    id: entity.id,
    orderId: entity.orderId,
    productId: entity.productId,
    variantId: entity.variantId,
    taxCategoryId: entity.taxCategoryId,
    quantity: entity.quantity,
    price: entity.price,
    notes: entity.notes,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function toOrderResponseDto(
  entity: OrderEntity,
  includeItems = false,
): OrderResponseDto {
  const dto: OrderResponseDto = {
    id: entity.id,
    tenantId: entity.tenantId,
    locationId: entity.locationId,
    customerId: entity.customerId,
    orderType: entity.orderType,
    status: entity.status,
    paymentStatus: entity.paymentStatus,
    paymentMethod: entity.paymentMethod,
    subtotal: entity.subtotal,
    discountTotal: entity.discountTotal,
    tax: entity.tax,
    total: entity.total,
    promotionIds: entity.promotionIds ?? [],
    appliedPromotions: entity.appliedPromotions ?? [],
    orderNumber: entity.orderNumber,
    deliveryDetails: entity.deliveryDetails,
    taxLines: entity.taxLines?.map(toOrderTaxLineResponseDto) ?? [],
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };

  if (includeItems && entity.items) {
    dto.items = entity.items.map(toOrderItemResponseDto);
  }

  return dto;
}

export function toOrderStatusHistoryResponseDto(
  entity: OrderStatusHistoryEntity,
): OrderStatusHistoryResponseDto {
  return {
    id: entity.id,
    orderId: entity.orderId,
    fromStatus: entity.fromStatus,
    toStatus: entity.toStatus,
    changedBy: entity.changedBy,
    reason: entity.reason,
    createdAt: entity.createdAt,
  };
}

export function toOrderEventResponseDto(entity: OrderEventEntity): OrderEventResponseDto {
  return {
    id: entity.id,
    orderId: entity.orderId,
    eventType: entity.eventType,
    metadata: entity.metadata,
    createdAt: entity.createdAt,
  };
}
