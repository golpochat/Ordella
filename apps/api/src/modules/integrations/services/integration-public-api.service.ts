import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity } from '../../orders/entities';
import { StockItemEntity } from '../../inventory/entities/stock-item.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';

@Injectable()
export class IntegrationPublicApiService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(StockItemEntity) private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(CustomerEntity) private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(LocationEntity) private readonly locations: Repository<LocationEntity>,
  ) {}

  listOrders(tenantId: string) {
    return this.orders.find({ where: { tenantId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async getOrder(tenantId: string, id: string) {
    const order = await this.orders.findOne({ where: { tenantId, id }, relations: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async catalog(tenantId: string) {
    const [categories, items] = await Promise.all([
      this.categories.find({ where: { tenantId }, order: { sortOrder: 'ASC', name: 'ASC' } }),
      this.products.find({ where: { tenantId }, order: { sortOrder: 'ASC', name: 'ASC' }, relations: { variants: true } }),
    ]);
    return { categories, items };
  }

  async getItem(tenantId: string, id: string) {
    const product = await this.products.findOne({ where: { tenantId, id }, relations: { variants: true } });
    if (!product) throw new NotFoundException('Item not found');
    return product;
  }

  listInventory(tenantId: string) {
    return this.stockItems.find({ where: { tenantId }, order: { name: 'ASC' }, take: 500 });
  }

  listCustomers(tenantId: string) {
    return this.customers.find({ where: { tenantId }, order: { lastOrderAt: 'DESC', createdAt: 'DESC' }, take: 100 });
  }

  async getCustomer(tenantId: string, id: string) {
    const customer = await this.customers.findOne({ where: { tenantId, id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  listLocations(tenantId: string) {
    return this.locations.find({ where: { tenantId }, order: { name: 'ASC' } });
  }
}
