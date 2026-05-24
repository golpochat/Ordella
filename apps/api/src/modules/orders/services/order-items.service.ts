import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreateOrderItemDto } from '../dto/order-items/create-order-item.dto';
import { UpdateOrderItemDto } from '../dto/order-items/update-order-item.dto';
import { OrderItemResponseDto } from '../dto/order-items/order-item-response.dto';

@Injectable()
export class OrderItemsService {
  create(_tenant: TenantContext, _dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    throw new NotImplementedException('create order-item');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    throw new NotImplementedException('update order-item');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove order-item');
  }
}
