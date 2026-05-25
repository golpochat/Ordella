import { Injectable } from '@nestjs/common';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { throwOnlineCategoryNotFound } from '../domain/online-domain.errors';
import { MenuQueryRepository } from '../repositories/menu-query.repository';
import {
  OnlineCategoryView,
  OnlineModifierView,
  OnlineProductView,
  OnlinePublicMenuView,
  OnlineVariantView,
} from '../types';

@Injectable()
export class MenuQueryService {
  constructor(private readonly menuRepository: MenuQueryRepository) {}

  async getPublicMenu(tenantId: string, locationId: string): Promise<OnlinePublicMenuView> {
    const categories = await this.getCategories(tenantId);
    const products = (await this.getProductsWithModifiers(tenantId, locationId)).filter(
      (product) => !product.isOutOfStock,
    );
    return { categories, products };
  }

  async getCategories(tenantId: string): Promise<OnlineCategoryView[]> {
    return this.menuRepository.findCategoriesForTenant(tenantId);
  }

  async getProductsWithModifiers(
    tenantId: string,
    locationId: string,
    categoryId?: string,
  ): Promise<OnlineProductView[]> {
    const products = await this.menuRepository.findActiveProductsForTenant(
      tenantId,
      locationId,
      categoryId,
    );

    const productIds = products.map((p) => p.id);
    const [variantsMap, stockMap] = await Promise.all([
      this.menuRepository.findVariantsForProducts(productIds),
      this.menuRepository.findStockByProductIds(tenantId, locationId, productIds),
    ]);

    const views: OnlineProductView[] = [];
    for (const product of products) {
      const modifiers = await this.menuRepository.findModifiersForProduct(tenantId, product.id);
      views.push(
        this.mapProduct(
          product,
          modifiers,
          variantsMap.get(product.id) ?? [],
          stockMap.get(product.id),
        ),
      );
    }
    return views;
  }

  async getProductsForCategory(
    tenantId: string,
    locationId: string,
    categoryId: string,
  ): Promise<OnlineProductView[]> {
    const categories = await this.getCategories(tenantId);
    if (!categories.some((category) => category.id === categoryId)) {
      throwOnlineCategoryNotFound(categoryId);
    }
    return this.getProductsWithModifiers(tenantId, locationId, categoryId);
  }

  private mapProduct(
    product: {
      id: string;
      name: string;
      description: string | null;
      categoryId: string | null;
      price: string;
      sortOrder: number;
      status: ProductStatus;
      sku: string | null;
      imageUrl: string | null;
      inventoryTrackingEnabled: boolean;
      stockLevel: number | null;
    },
    modifiers: OnlineModifierView[],
    variants: Array<{ id: string; name: string; priceDelta: string; sku: string | null }>,
    locationStock?: number,
  ): OnlineProductView {
    let availableQuantity: number | null = null;
    if (product.inventoryTrackingEnabled) {
      if (locationStock !== undefined) {
        availableQuantity = Math.max(0, Math.floor(locationStock));
      } else if (product.stockLevel !== null && product.stockLevel !== undefined) {
        availableQuantity = product.stockLevel;
      }
    } else if (locationStock !== undefined) {
      availableQuantity = Math.max(0, Math.floor(locationStock));
    }

    const isOutOfStock =
      product.inventoryTrackingEnabled &&
      availableQuantity !== null &&
      availableQuantity <= 0;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      sortOrder: product.sortOrder,
      sku: product.sku,
      imageUrl: product.imageUrl,
      availableQuantity,
      isOutOfStock,
      inventoryTrackingEnabled: product.inventoryTrackingEnabled,
      variants: variants.map(
        (v): OnlineVariantView => ({
          id: v.id,
          name: v.name,
          priceDelta: v.priceDelta,
          sku: v.sku,
        }),
      ),
      modifiers,
    };
  }

  private isOrderable(product: OnlineProductView): boolean {
    if (!product.inventoryTrackingEnabled) {
      return product.availableQuantity === null || product.availableQuantity > 0;
    }
    return product.availableQuantity !== null && product.availableQuantity > 0;
  }
}
