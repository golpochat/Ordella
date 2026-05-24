import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { CreateOrderDto } from '../../orders/dto';
import { OrderType } from '../../orders/enums/order-type.enum';
import { OrdersService } from '../../orders/services/orders.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { InventoryOrderContext } from '../../inventory/types/inventory-order.context';
import { PaymentsService } from '../../payments/services/payments.service';
import { DeliveryService } from '../../deliveries/services/delivery.service';
import { BasketService } from './basket.service';
import { OnlinePaymentDto } from '../dto/online-payment.dto';
import {
  throwOnlineCheckoutRequired,
  throwOnlineOrderNotFound,
  throwOnlinePaymentFailed,
} from '../domain/online-domain.errors';
import { OnlineOrderType } from '../enums/online-order-type.enum';
import { OnlineOrderStatusResponseDto } from '../dto/online-order-status-response.dto';
import { OnlinePaymentResponseDto } from '../dto/online-payment-response.dto';

@Injectable()
export class OnlineOrderService {
  constructor(
    private readonly basketService: BasketService,
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService,
    private readonly paymentsService: PaymentsService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async placeOrder(
    tenant: TenantContext,
    dto: OnlinePaymentDto,
  ): Promise<OnlinePaymentResponseDto> {
    const basket = this.basketService.getBasket(tenant.tenantId, dto.sessionId);
    if (!basket.checkout) {
      throwOnlineCheckoutRequired(dto.sessionId);
    }

    const checkout = basket.checkout;
    const createDto: CreateOrderDto = {
      locationId: basket.locationId,
      orderType: this.mapOrderType(checkout.orderType as OnlineOrderType),
      customerId: dto.customerId,
      paymentMethod: dto.method,
      items: basket.items.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        modifierOptionIds: line.modifierOptionIds,
        notes: line.notes,
      })),
      ...(checkout.delivery
        ? {
            deliveryDetails: {
              addressLine1: checkout.delivery.addressLine1,
              addressLine2: checkout.delivery.addressLine2,
              city: checkout.delivery.city,
              postalCode: checkout.delivery.postalCode,
              instructions: checkout.delivery.instructions,
              contactPhone: checkout.delivery.contactPhone ?? checkout.customer.phone,
            },
          }
        : {}),
    };

    const order = await this.ordersService.create(tenant, createDto);

    await this.inventoryService.reserve(this.toInventoryContext(tenant.tenantId, order));

    const paymentContext = {
      ...checkout.paymentContext,
      tenantId: tenant.tenantId,
      orderId: order.id,
      method: dto.method,
      amount: checkout.totals.grandTotal,
      currency: dto.currency ?? checkout.paymentContext.currency,
    };

    const intent = await this.paymentsService.createPaymentIntent(paymentContext);
    const capture = await this.paymentsService.authorizeOrCapture(paymentContext);

    if (capture.status !== 'captured') {
      throwOnlinePaymentFailed(capture.failureReason);
    }

    if (createDto.orderType === OrderType.DELIVERY) {
      await this.deliveryService.createTask({
        tenantId: tenant.tenantId,
        orderId: order.id,
        metadata: {
          customerName: checkout.customer.name,
          customerPhone: checkout.customer.phone,
          deliveryAddress: checkout.delivery,
        },
      });
    }

    this.basketService.linkOrder(dto.sessionId, order.id);
    this.basketService.clearBasket(dto.sessionId);

    const refreshed = await this.ordersService.findOne(tenant, order.id);

    return {
      sessionId: dto.sessionId,
      orderId: refreshed.id,
      orderNumber: refreshed.orderNumber,
      paymentId: capture.paymentId,
      paymentIntentId: intent.paymentId,
      paymentStatus: refreshed.paymentStatus,
      orderStatus: refreshed.status,
      total: refreshed.total,
    };
  }

  async getOrderStatus(
    tenant: TenantContext,
    orderId: string,
  ): Promise<OnlineOrderStatusResponseDto> {
    const order = await this.ordersService.findOne(tenant, orderId);

    if (
      order.orderType !== OrderType.ONLINE &&
      order.orderType !== OrderType.DELIVERY &&
      order.orderType !== OrderType.PICKUP
    ) {
      throwOnlineOrderNotFound(orderId);
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderType: order.orderType,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString() ?? null,
    };
  }

  private mapOrderType(orderType: OnlineOrderType): OrderType {
    if (orderType === OnlineOrderType.DELIVERY) {
      return OrderType.DELIVERY;
    }
    if (orderType === OnlineOrderType.PICKUP) {
      return OrderType.PICKUP;
    }
    return OrderType.ONLINE;
  }

  private toInventoryContext(
    tenantId: string,
    order: { id: string; locationId: string; items?: Array<{ productId: string; quantity: number }> },
  ): InventoryOrderContext {
    return {
      tenantId,
      orderId: order.id,
      locationId: order.locationId,
      lines: (order.items ?? []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
  }
}
