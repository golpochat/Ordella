import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { KdsCatalogLookup } from '../mappers/kds-order.mapper';

@Injectable()
export class KdsCatalogLookupService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variants: Repository<VariantEntity>,
  ) {}

  async buildLookupForOrders(tenantId: string, orders: OrderEntity[]): Promise<KdsCatalogLookup> {
    const productIds = new Set<string>();
    const variantIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.items ?? []) {
        productIds.add(item.productId);
        if (item.variantId) variantIds.add(item.variantId);
      }
    }

    const [productRows, variantRows] = await Promise.all([
      productIds.size
        ? this.products.find({ where: { tenantId, id: In([...productIds]) } })
        : Promise.resolve([]),
      variantIds.size
        ? this.variants.find({ where: { id: In([...variantIds]) } })
        : Promise.resolve([]),
    ]);

    return {
      products: new Map(
        productRows.map((p) => [p.id, { name: p.name, sku: p.sku }]),
      ),
      variants: new Map(
        variantRows.map((v) => [v.id, { name: v.name, sku: v.sku }]),
      ),
    };
  }
}
