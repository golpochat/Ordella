import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ProductEntity } from '../../catalog/entities/product.entity';

export const KDS_DEFAULT_ACTIVE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];

@Injectable()
export class KdsOrderQueryRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findActiveOrdersForTenant(
    tenantId: string,
    statuses: OrderStatus[],
    station?: string,
    locationId?: string,
  ): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: {
        tenantId,
        status: In(statuses),
        ...(locationId ? { locationId } : {}),
      },
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });

    if (!station) {
      return orders;
    }

    const productIds = [
      ...new Set(orders.flatMap((order) => (order.items ?? []).map((item) => item.productId))),
    ];
    if (!productIds.length) {
      return [];
    }

    const products = await this.productRepository.find({
      where: { tenantId, id: In(productIds) },
      select: ['id', 'categoryId'],
    });
    const productCategory = new Map(products.map((p) => [p.id, p.categoryId]));

    return orders.filter((order) =>
      (order.items ?? []).some((item) => {
        const categoryId = productCategory.get(item.productId);
        return categoryId === station;
      }),
    );
  }

  findOrderWithItemsForTenant(
    tenantId: string,
    orderId: string,
  ): Promise<OrderEntity | null> {
    return this.orderRepository.findOne({
      where: { id: orderId, tenantId },
      relations: ['items'],
    });
  }
}
