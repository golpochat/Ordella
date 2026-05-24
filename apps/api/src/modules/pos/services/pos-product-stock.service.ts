import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities/product.entity';

@Injectable()
export class PosProductStockService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
  ) {}

  async decrementForOrder(
    tenantId: string,
    lines: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    for (const line of lines) {
      const product = await this.products.findOne({
        where: { id: line.productId, tenantId },
      });
      if (!product?.inventoryTrackingEnabled || product.stockLevel === null) {
        continue;
      }
      product.stockLevel = Math.max(0, product.stockLevel - line.quantity);
      await this.products.save(product);
    }
  }
}
