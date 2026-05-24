import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { ModifierEntity } from '../../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../../catalog/entities/modifier-option.entity';
import { ProductModifierEntity } from '../../catalog/entities/product-modifier.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { StockItemEntity } from '../../inventory/entities/stock-item.entity';
import { availableQty } from '../../inventory/domain/stock-quantity.util';
import { isOnlineChannelVisible } from '../domain/online-pricing.util';
import {
  OnlineCategoryView,
  OnlineModifierView,
  OnlineProductView,
  OnlinePublicMenuView,
} from '../types';

@Injectable()
export class MenuQueryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ModifierEntity)
    private readonly modifierRepository: Repository<ModifierEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptionRepository: Repository<ModifierOptionEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(ProductModifierEntity)
    private readonly productModifierRepository: Repository<ProductModifierEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItemRepository: Repository<StockItemEntity>,
  ) {}

  async findCategoriesForTenant(tenantId: string): Promise<OnlineCategoryView[]> {
    const rows = await this.categoryRepository.find({
      where: { tenantId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
    }));
  }

  async findActiveProductsForTenant(
    tenantId: string,
    locationId?: string,
    categoryId?: string,
  ): Promise<ProductEntity[]> {
    const products = await this.productRepository.find({
      where: {
        tenantId,
        status: ProductStatus.ACTIVE,
        ...(categoryId ? { categoryId } : {}),
      },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return products.filter((product) => isOnlineChannelVisible(product.channelVisibility));
  }

  async findModifierIdsForProduct(productId: string): Promise<string[]> {
    const rows = await this.productModifierRepository.find({ where: { productId } });
    return rows.map((row) => row.modifierId);
  }

  async findVariantsForProducts(productIds: string[]): Promise<Map<string, VariantEntity[]>> {
    if (!productIds.length) return new Map();
    const variants = await this.variantRepository.find({
      where: { productId: In(productIds) },
      order: { name: 'ASC' },
    });
    const map = new Map<string, VariantEntity[]>();
    for (const variant of variants) {
      const list = map.get(variant.productId) ?? [];
      list.push(variant);
      map.set(variant.productId, list);
    }
    return map;
  }

  async findModifiersForTenant(tenantId: string): Promise<OnlineModifierView[]> {
    const modifiers = await this.modifierRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    if (!modifiers.length) {
      return [];
    }

    const options = await this.modifierOptionRepository.find({
      where: { modifierId: In(modifiers.map((m) => m.id)) },
      order: { name: 'ASC' },
    });

    const optionsByModifier = new Map<string, ModifierOptionEntity[]>();
    for (const option of options) {
      const list = optionsByModifier.get(option.modifierId) ?? [];
      list.push(option);
      optionsByModifier.set(option.modifierId, list);
    }

    return modifiers.map((modifier) => ({
      id: modifier.id,
      name: modifier.name,
      type: modifier.type,
      required: modifier.required,
      options: (optionsByModifier.get(modifier.id) ?? []).map((option) => ({
        id: option.id,
        name: option.name,
        priceDelta: option.priceDelta,
      })),
    }));
  }

  async findModifiersForProduct(
    tenantId: string,
    productId: string,
  ): Promise<OnlineModifierView[]> {
    const modifierIds = await this.findModifierIdsForProduct(productId);
    if (!modifierIds.length) return [];
    const all = await this.findModifiersForTenant(tenantId);
    return all.filter((modifier) => modifierIds.includes(modifier.id));
  }

  async findStockByProductIds(
    tenantId: string,
    locationId: string,
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (!productIds.length) {
      return new Map();
    }

    const rows = await this.stockItemRepository.find({
      where: {
        tenantId,
        locationId,
        productId: In(productIds),
      },
    });

    const stockMap = new Map<string, number>();
    for (const row of rows) {
      if (!row.productId) {
        continue;
      }
      const available = availableQty(row.quantityOnHand, row.quantityReserved);
      stockMap.set(row.productId, (stockMap.get(row.productId) ?? 0) + available);
    }
    return stockMap;
  }

  async findProductByIdForTenant(tenantId: string, productId: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({ where: { tenantId, id: productId } });
  }

  async findVariantById(variantId: string): Promise<VariantEntity | null> {
    return this.variantRepository.findOne({ where: { id: variantId } });
  }

  async findModifierOptionsByIds(optionIds: string[]): Promise<ModifierOptionEntity[]> {
    if (!optionIds.length) {
      return [];
    }
    return this.modifierOptionRepository.find({ where: { id: In(optionIds) } });
  }

  async getAvailableQuantity(
    tenantId: string,
    locationId: string,
    productId: string,
  ): Promise<number | null> {
    const stockMap = await this.findStockByProductIds(tenantId, locationId, [productId]);
    if (!stockMap.has(productId)) {
      return null;
    }
    return stockMap.get(productId) ?? 0;
  }
}
