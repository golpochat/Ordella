import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderType } from '../enums/order-type.enum';
import { OrderEntity } from '../entities/order.entity';
import { DeliveryService } from '../integrations/delivery.service';
import { OrderDeliveryContext } from '../types/order-delivery.context';
import { OrderDeliveryDetails } from '../types/order-delivery-details.types';
import { CreateOrderDeliveryDetailsDto } from '../dto/orders/create-order-delivery-details.dto';

/**
 * Orders-domain delivery orchestration — delegates to DeliveriesModule placeholders.
 */
@Injectable()
export class OrderDeliveryService {
  constructor(private readonly deliveryService: DeliveryService) {}

  assertDeliveryDetailsForCreate(
    orderType: OrderType,
    deliveryDetails?: CreateOrderDeliveryDetailsDto,
  ): void {
    if (orderType === OrderType.DELIVERY && !deliveryDetails) {
      throw new BadRequestException('deliveryDetails is required for delivery orders');
    }
  }

  toDeliveryDetailsSnapshot(
    dto: CreateOrderDeliveryDetailsDto,
  ): OrderDeliveryDetails {
    return {
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2 ?? null,
      city: dto.city,
      postalCode: dto.postalCode ?? null,
      instructions: dto.instructions ?? null,
      contactPhone: dto.contactPhone ?? null,
    };
  }

  async onOrderReady(context: OrderDeliveryContext, order: OrderEntity): Promise<void> {
    if (order.orderType !== OrderType.DELIVERY) {
      return;
    }
    await this.deliveryService.createTask(context);
    await this.deliveryService.assignDriver(context);
  }

  async onOutForDelivery(context: OrderDeliveryContext): Promise<void> {
    await this.deliveryService.markOutForDelivery(context);
  }

  async onCompleted(context: OrderDeliveryContext): Promise<void> {
    await this.deliveryService.markDelivered(context);
  }
}
