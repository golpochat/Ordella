import { Injectable } from '@nestjs/common';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { ModifierType } from '../../catalog/enums/modifier-type.enum';
import { throwAdminResourceNotFound, throwAdminUnsafeProductUpdate } from '../domain/admin-domain.errors';
import { AdminProductRepository, AdminProductListFilter } from '../repositories/admin-product.repository';
import { AdminCatalogRepository } from '../repositories/admin-catalog.repository';
import { AdminOrderQueryRepository } from '../repositories/admin-order-query.repository';
import { AdminCreateProductDto } from '../dto/admin-create-product.dto';
import { AdminUpdateProductDto } from '../dto/admin-update-product.dto';
import { AdminCreateCategoryDto } from '../dto/admin-create-category.dto';
import { AdminCreateModifierDto } from '../dto/admin-create-modifier.dto';
import { AdminCreateModifierOptionDto } from '../dto/admin-create-modifier-option.dto';
import { SearchIndexService } from '../../search';

@Injectable()
export class ProductAdminService {
  constructor(
    private readonly productRepository: AdminProductRepository,
    private readonly catalogRepository: AdminCatalogRepository,
    private readonly orderQueryRepository: AdminOrderQueryRepository,
    private readonly searchIndex: SearchIndexService,
  ) {}

  listProducts(tenantId: string, filter: AdminProductListFilter) {
    return this.productRepository.findAllForTenant(tenantId, filter);
  }

  async createProduct(tenantId: string, dto: AdminCreateProductDto) {
    const product = this.productRepository.create({
      tenantId,
      name: dto.name,
      description: dto.description ?? null,
      categoryId: dto.categoryId ?? null,
      taxCategoryId: dto.taxCategoryId ?? null,
      price: dto.price,
      status: dto.status ?? ProductStatus.DRAFT,
      sortOrder: dto.sortOrder ?? 0,
      channelVisibility: dto.channelVisibility ?? {},
    });
    const saved = await this.productRepository.save(product);
    await this.searchIndex.indexItem(saved);
    return saved;
  }

  async updateProduct(tenantId: string, productId: string, dto: AdminUpdateProductDto) {
    const product = await this.requireProduct(tenantId, productId);
    await this.assertSafeProductChange(tenantId, productId);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.taxCategoryId !== undefined) product.taxCategoryId = dto.taxCategoryId;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.sortOrder !== undefined) product.sortOrder = dto.sortOrder;
    if (dto.channelVisibility !== undefined) product.channelVisibility = dto.channelVisibility;

    const saved = await this.productRepository.save(product);
    await this.searchIndex.indexItem(saved);
    return saved;
  }

  async archiveProduct(tenantId: string, productId: string) {
    const product = await this.requireProduct(tenantId, productId);
    await this.assertSafeProductChange(tenantId, productId);
    product.status = ProductStatus.INACTIVE;
    const saved = await this.productRepository.save(product);
    await this.searchIndex.indexItem(saved);
    return saved;
  }

  listCategories(tenantId: string) {
    return this.catalogRepository.listCategories(tenantId);
  }

  async createCategory(tenantId: string, dto: AdminCreateCategoryDto) {
    const category = this.catalogRepository.createCategory({
      tenantId,
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
      taxCategoryId: dto.taxCategoryId ?? null,
    });
    const saved = await this.catalogRepository.saveCategory(category);
    await this.searchIndex.indexCategory(saved);
    return saved;
  }

  listModifiers(tenantId: string) {
    return this.catalogRepository.listModifiers(tenantId);
  }

  async createModifier(tenantId: string, dto: AdminCreateModifierDto) {
    const modifier = this.catalogRepository.createModifier({
      tenantId,
      name: dto.name,
      type: dto.type ?? ModifierType.SINGLE,
      required: dto.required ?? false,
    });
    return this.catalogRepository.saveModifier(modifier);
  }

  async addModifierOption(tenantId: string, modifierId: string, dto: AdminCreateModifierOptionDto) {
    const modifier = await this.catalogRepository.findModifier(tenantId, modifierId);
    if (!modifier) {
      throwAdminResourceNotFound('modifier', modifierId);
    }
    const option = this.catalogRepository.createModifierOption({
      modifierId,
      name: dto.name,
      priceDelta: dto.priceDelta ?? '0.00',
    });
    return this.catalogRepository.saveModifierOption(option);
  }

  private async requireProduct(tenantId: string, productId: string) {
    const product = await this.productRepository.findByIdForTenant(tenantId, productId);
    if (!product) {
      throwAdminResourceNotFound('product', productId);
    }
    return product;
  }

  private async assertSafeProductChange(tenantId: string, productId: string): Promise<void> {
    const openCount = await this.orderQueryRepository.countOpenOrdersWithProduct(tenantId, productId);
    if (openCount > 0) {
      throwAdminUnsafeProductUpdate(productId);
    }
  }
}
