import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { formatMoney } from '../domain/order-totals.util';

export interface ResolvedLinePrice {
  productId: string;
  variantId: string | null;
  unitPrice: string;
}

@Injectable()
export class OrderPricingService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
  ) {}

  async resolveLinePrice(
    tenant: TenantContext,
    productId: string,
    variantId?: string | null,
  ): Promise<ResolvedLinePrice> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId: tenant.tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    let unitAmount = Number(product.price);

    if (variantId) {
      const variant = await this.variantRepository.findOne({
        where: { id: variantId, productId: product.id },
      });
      if (!variant) {
        throw new NotFoundException(`Variant ${variantId} not found for product`);
      }
      unitAmount += Number(variant.priceDelta);
    }

    return {
      productId,
      variantId: variantId ?? null,
      unitPrice: formatMoney(unitAmount),
    };
  }
}
