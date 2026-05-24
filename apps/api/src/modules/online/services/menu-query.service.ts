import { Injectable } from '@nestjs/common';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { throwOnlineCategoryNotFound } from '../domain/online-domain.errors';
import { MenuQueryRepository } from '../repositories/menu-query.repository';
import {
  OnlineCategoryView,
  OnlineModifierView,
  OnlineProductView,
  OnlinePublicMenuView,
} from '../types';

@Injectable()
export class MenuQueryService {
  constructor(private readonly menuRepository: MenuQueryRepository) {}

  async getPublicMenu(tenantId: string, locationId: string): Promise<OnlinePublicMenuView> {
    const categories = await this.getCategories(tenantId);
    const products = await this.getProductsWithModifiers(tenantId, locationId);
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
    const [products, modifiers] = await Promise.all([
      this.menuRepository.findActiveProductsForTenant(tenantId, locationId, categoryId),
      this.menuRepository.findModifiersForTenant(tenantId),
    ]);

    const stockMap = await this.menuRepository.findStockByProductIds(
      tenantId,
      locationId,
      products.map((product) => product.id),
    );

    return products
      .map((product) => this.mapProduct(product, modifiers, stockMap.get(product.id)))
      .filter((product) => product.availableQuantity === null || product.availableQuantity > 0);
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
    },
    modifiers: OnlineModifierView[],
    availableQuantity?: number,
  ): OnlineProductView {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      sortOrder: product.sortOrder,
      availableQuantity: availableQuantity ?? null,
      modifiers,
    };
  }
}
