import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { CreateOrderDto, OrderResponseDto } from '../../orders/dto';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { OrderPaymentMethod } from '../../orders/enums/order-payment-method.enum';
import { OrdersService } from '../../orders/services/orders.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { DeliveryService } from '../../deliveries/services/delivery.service';
import { DeliveryTaskRepository } from '../../deliveries/repositories/delivery-task.repository';
import { DriverProfileRepository } from '../../deliveries/repositories/driver-profile.repository';
import {
  labelDriverDisplayStatus,
  mapDriverDisplayStatus,
} from '../../deliveries/mappers/driver-display-status.mapper';
import { DeliveryTaskStatus } from '../../deliveries/enums/delivery-task-status.enum';
import { KdsBroadcastService } from '../../kds/services/kds-broadcast.service';
import { KdsOrderQueryService } from '../../kds/services/kds-order-query.service';
import { CreateOnlineOrderDto } from '../../orders/dto/orders/create-online-order.dto';
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
import { LoyaltyService } from '../../loyalty/services';

@Injectable()
export class OnlineOrderService {
  constructor(
    private readonly basketService: BasketService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly deliveryService: DeliveryService,
    private readonly deliveryTaskRepository: DeliveryTaskRepository,
    private readonly driverProfileRepository: DriverProfileRepository,
    private readonly kdsOrderQuery: KdsOrderQueryService,
    private readonly kdsBroadcast: KdsBroadcastService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async createOnlineOrder(
    tenant: TenantContext,
    dto: CreateOnlineOrderDto,
  ): Promise<OrderResponseDto> {
    const customer = await this.loyaltyService.findOrCreateCustomer(tenant.tenantId, dto.customer);
    const createDto: CreateOrderDto = {
      locationId: dto.locationId,
      orderType: this.mapOrderType(dto.orderType),
      paymentMethod: dto.paymentMethod ?? OrderPaymentMethod.CASH,
      customerId: customer?.id,
      loyaltyRedeemPoints: dto.loyaltyRedeemPoints,
      items: dto.items.map((item) => ({
        productId: item.itemId,
        variantId: item.variantId,
        quantity: item.quantity,
        modifierOptionIds: item.modifiers,
      })),
      ...(dto.delivery && dto.orderType === OnlineOrderType.DELIVERY
        ? {
            deliveryDetails: {
              addressLine1: dto.delivery.addressLine1,
              addressLine2: dto.delivery.addressLine2,
              city: dto.delivery.city,
              postalCode: dto.delivery.postalCode,
              instructions: dto.delivery.instructions ?? dto.notes,
              contactPhone: dto.customer.phone,
            },
          }
        : {}),
    };

    const order = await this.ordersService.create(tenant, createDto);

    const paymentContext = {
      tenantId: tenant.tenantId,
      orderId: order.id,
      method: createDto.paymentMethod ?? OrderPaymentMethod.CASH,
      amount: order.total,
      currency: 'EUR',
      reason: 'online_storefront',
    };

    const capture = await this.paymentsService.authorizeOrCapture(paymentContext);
    if (capture.status !== 'captured') {
      throwOnlinePaymentFailed(capture.failureReason);
    }

    const updated = await this.ordersService.update(tenant, order.id, {
      status: OrderStatus.ACCEPTED,
    });

    if (createDto.orderType === OrderType.DELIVERY && dto.delivery) {
      await this.deliveryService.createTask({
        tenantId: tenant.tenantId,
        orderId: order.id,
        metadata: {
          customerName: dto.customer.name,
          customerPhone: dto.customer.phone,
          deliveryAddress: dto.delivery,
        },
      });
    }

    await this.routeToFulfillment(tenant.tenantId, updated.id);
    return updated;
  }

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

    const refreshed = await this.ordersService.update(tenant, order.id, {
      status: OrderStatus.ACCEPTED,
    });
    await this.routeToFulfillment(tenant.tenantId, refreshed.id);

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
      order.orderType !== OrderType.PICKUP &&
      order.orderType !== OrderType.POS
    ) {
      throwOnlineOrderNotFound(orderId);
    }

    const base = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderType: order.orderType,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString() ?? null,
    };

    if (order.orderType !== OrderType.DELIVERY && order.orderType !== OrderType.PICKUP) {
      return base;
    }

    const task = await this.deliveryTaskRepository.findByOrderForTenant(
      tenant.tenantId,
      orderId,
    );
    if (!task) {
      return base;
    }

    const display = mapDriverDisplayStatus(task.status, Boolean(task.driverId));
    let driverName: string | null = null;
    if (task.driverId) {
      const driver = await this.driverProfileRepository.findByIdForTenant(
        tenant.tenantId,
        task.driverId,
      );
      driverName = driver?.name ?? null;
    }

    return {
      ...base,
      driverName,
      driverStatus: display,
      driverStatusLabel: labelDriverDisplayStatus(display),
      deliveryConfirmed:
        task.status === DeliveryTaskStatus.DELIVERED ||
        order.status === OrderStatus.COMPLETED,
    };
  }

  private async routeToFulfillment(tenantId: string, orderId: string): Promise<void> {
    const detail = await this.kdsOrderQuery.getOrderDetails(tenantId, orderId);
    this.kdsBroadcast.orderCreated(tenantId, detail);
  }

  private mapOrderType(orderType: OnlineOrderType): OrderType {
    if (orderType === OnlineOrderType.DELIVERY) {
      return OrderType.DELIVERY;
    }
    if (orderType === OnlineOrderType.PICKUP) {
      return OrderType.PICKUP;
    }
    if (orderType === OnlineOrderType.IN_STORE) {
      return OrderType.POS;
    }
    return OrderType.ONLINE;
  }

}
