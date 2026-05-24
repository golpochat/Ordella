import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';

export interface AdminOrderListFilter {
  status?: OrderStatus;
  channel?: OrderType;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminOrderQueryRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  findForTenant(tenantId: string, filter: AdminOrderListFilter): Promise<OrderEntity[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;

    return this.repository.find({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.channel ? { orderType: filter.channel } : {}),
        ...(filter.from && filter.to
          ? { createdAt: Between(filter.from, filter.to) }
          : {}),
      },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countOpenOrdersWithProduct(tenantId: string, productId: string): Promise<number> {
    return this.repository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('item.productId = :productId', { productId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      })
      .getCount();
  }
}
