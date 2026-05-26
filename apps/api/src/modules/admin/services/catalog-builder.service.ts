import { Injectable } from '@nestjs/common';
import { ModifierType } from '../../catalog/enums/modifier-type.enum';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import { CatalogBuilderRepository } from '../repositories/catalog-builder.repository';
import {
  CatalogCategoryCreateDto,
  CatalogCategoryDeleteDto,
  CatalogCategoryUpdateDto,
  CatalogItemAddModifierDto,
  CatalogItemCreateDto,
  CatalogItemDeleteDto,
  CatalogItemImageDto,
  CatalogItemUpdateDto,
  CatalogVariantDto,
  GlobalCategoryCreateDto,
  GlobalCategoryUpdateDto,
  GlobalItemCreateDto,
  GlobalItemUpdateDto,
  LocalCatalogOverrideDto,
  LocalCatalogResetOverrideDto,
} from '../dto/catalog-builder.dto';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { GlobalCategoryEntity } from '../../catalog/entities/global-category.entity';
import { GlobalItemEntity } from '../../catalog/entities/global-item.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { isPosChannelVisible, isOnlineChannelVisible } from '../../online/domain/online-pricing.util';
import { SearchIndexService } from '../../search';

export type CatalogCategoryView = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  globalCategoryId?: string | null;
  taxCategoryId?: string | null;
};

export type GlobalCategoryView = {
  id: string;
  brandGroupId: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type GlobalItemView = {
  id: string;
  brandGroupId: string;
  globalCategoryId: string | null;
  name: string;
  description: string | null;
  basePrice: string;
  sku: string | null;
  barcode: string | null;
  taxCategoryId: string | null;
  imageUrl: string | null;
  attributes: Record<string, unknown>;
  isActive: boolean;
  localItemId?: string | null;
  overrideUsage?: number;
};

export type CatalogModifierOptionView = {
  id: string;
  name: string;
  priceDelta: string;
};

export type CatalogModifierView = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: CatalogModifierOptionView[];
};

export type CatalogVariantView = {
  id: string;
  itemId: string;
  name: string;
  priceDelta: string;
  sku: string | null;
};

export type CatalogItemView = {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  isActive: boolean;
  status: ProductStatus;
  sortOrder: number;
  inventoryTrackingEnabled: boolean;
  stockLevel: number | null;
  channelVisibility: Record<string, boolean>;
  taxCategoryId: string | null;
  variants: CatalogVariantView[];
  modifiers: CatalogModifierView[];
  globalItemId?: string | null;
  globalCategoryId?: string | null;
  catalogSource?: 'local' | 'inherited' | 'overridden';
  baseName?: string | null;
  baseDescription?: string | null;
  basePrice?: string | null;
  attributes?: Record<string, unknown>;
  overrideAttributes?: Record<string, unknown>;
};

@Injectable()
export class CatalogBuilderService {
  constructor(
    private readonly repository: CatalogBuilderRepository,
    private readonly searchIndex: SearchIndexService,
  ) {}

  async listGlobalItems(tenantId: string): Promise<GlobalItemView[]> {
    const group = await this.ensureBrandGroup(tenantId);
    const items = await this.repository.listGlobalItems(group.id);
    return Promise.all(items.map((item) => this.mapGlobalItemWithUsage(tenantId, item)));
  }

  async createGlobalItem(tenantId: string, dto: GlobalItemCreateDto): Promise<GlobalItemView> {
    const group = await this.ensureBrandGroup(tenantId);
    if (dto.globalCategoryId) {
      await this.requireGlobalCategory(group.id, dto.globalCategoryId);
    }
    const saved = await this.repository.saveGlobalItem(
      this.repository.createGlobalItem({
        brandGroupId: group.id,
        globalCategoryId: dto.globalCategoryId ?? null,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        basePrice: dto.basePrice,
        sku: dto.sku?.trim() ?? null,
        barcode: dto.barcode?.trim() ?? null,
        taxCategoryId: dto.taxCategoryId ?? null,
        imageUrl: dto.imageUrl ?? null,
        attributes: dto.attributes ?? {},
        isActive: dto.isActive ?? true,
      }),
    );
    await this.ensureLocalProductForGlobalItem(tenantId, saved);
    return this.mapGlobalItemWithUsage(tenantId, saved);
  }

  async updateGlobalItem(tenantId: string, dto: GlobalItemUpdateDto): Promise<GlobalItemView> {
    const group = await this.ensureBrandGroup(tenantId);
    const item = await this.requireGlobalItem(group.id, dto.id);
    if (dto.globalCategoryId) {
      await this.requireGlobalCategory(group.id, dto.globalCategoryId);
    }
    item.globalCategoryId = dto.globalCategoryId ?? null;
    item.name = dto.name.trim();
    item.description = dto.description?.trim() ?? null;
    item.basePrice = dto.basePrice;
    item.sku = dto.sku?.trim() ?? null;
    item.barcode = dto.barcode?.trim() ?? null;
    item.taxCategoryId = dto.taxCategoryId ?? null;
    item.imageUrl = dto.imageUrl ?? null;
    item.attributes = dto.attributes ?? {};
    item.isActive = dto.isActive ?? true;
    const saved = await this.repository.saveGlobalItem(item);
    await this.ensureLocalProductForGlobalItem(tenantId, saved);
    return this.mapGlobalItemWithUsage(tenantId, saved);
  }

  async listGlobalCategories(tenantId: string): Promise<GlobalCategoryView[]> {
    const group = await this.ensureBrandGroup(tenantId);
    const categories = await this.repository.listGlobalCategories(group.id);
    return categories.map((category) => this.mapGlobalCategory(category));
  }

  async createGlobalCategory(tenantId: string, dto: GlobalCategoryCreateDto): Promise<GlobalCategoryView> {
    const group = await this.ensureBrandGroup(tenantId);
    const saved = await this.repository.saveGlobalCategory(
      this.repository.createGlobalCategory({
        brandGroupId: group.id,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
    await this.ensureLocalCategoryForGlobalCategory(tenantId, saved);
    return this.mapGlobalCategory(saved);
  }

  async updateGlobalCategory(tenantId: string, dto: GlobalCategoryUpdateDto): Promise<GlobalCategoryView> {
    const group = await this.ensureBrandGroup(tenantId);
    const category = await this.requireGlobalCategory(group.id, dto.id);
    category.name = dto.name.trim();
    category.description = dto.description?.trim() ?? null;
    category.sortOrder = dto.sortOrder ?? 0;
    const saved = await this.repository.saveGlobalCategory(category);
    await this.ensureLocalCategoryForGlobalCategory(tenantId, saved);
    return this.mapGlobalCategory(saved);
  }

  async listLocalCatalog(tenantId: string): Promise<CatalogItemView[]> {
    await this.ensureInheritedLocalProducts(tenantId);
    return this.listItems(tenantId);
  }

  async overrideLocalItem(tenantId: string, dto: LocalCatalogOverrideDto): Promise<CatalogItemView> {
    const group = await this.ensureBrandGroup(tenantId);
    const globalItem = await this.requireGlobalItem(group.id, dto.globalItemId);
    let product = dto.localItemId
      ? await this.requireProduct(tenantId, dto.localItemId)
      : await this.ensureLocalProductForGlobalItem(tenantId, globalItem);
    if (product.globalItemId !== globalItem.id) {
      product.globalItemId = globalItem.id;
    }
    product.overridePrice = dto.overridePrice?.trim() || null;
    product.overrideName = dto.overrideName?.trim() || null;
    product.overrideDescription = dto.overrideDescription?.trim() || null;
    product.overrideAttributes = dto.overrideAttributes ?? {};
    if (dto.isActive !== undefined) {
      product.status = dto.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    }
    const saved = await this.repository.saveProduct(product);
    await this.searchIndex.indexItem(saved);
    return this.mapItem(tenantId, saved);
  }

  async resetLocalOverride(tenantId: string, dto: LocalCatalogResetOverrideDto): Promise<CatalogItemView> {
    const product = await this.requireProduct(tenantId, dto.localItemId);
    product.overridePrice = null;
    product.overrideName = null;
    product.overrideDescription = null;
    product.overrideAttributes = {};
    const saved = await this.repository.saveProduct(product);
    await this.searchIndex.indexItem(saved);
    return this.mapItem(tenantId, saved);
  }

  async listCategories(tenantId: string): Promise<CatalogCategoryView[]> {
    await this.ensureInheritedLocalCategories(tenantId);
    const rows = await this.repository.listCategories(tenantId);
    return rows.map((row) => this.mapCategory(row));
  }

  async createCategory(tenantId: string, dto: CatalogCategoryCreateDto): Promise<CatalogCategoryView> {
    const saved = await this.repository.saveCategory(
      this.repository.createCategory({
        tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        taxCategoryId: dto.taxCategoryId ?? null,
      }),
    );
    await this.searchIndex.indexCategory(saved);
    return this.mapCategory(saved);
  }

  async updateCategory(tenantId: string, dto: CatalogCategoryUpdateDto): Promise<CatalogCategoryView> {
    const row = await this.requireCategory(tenantId, dto.id);
    if (dto.name !== undefined) row.name = dto.name.trim();
    if (dto.description !== undefined) row.description = dto.description?.trim() ?? null;
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    if (dto.taxCategoryId !== undefined) row.taxCategoryId = dto.taxCategoryId ?? null;
    const saved = await this.repository.saveCategory(row);
    await this.searchIndex.indexCategory(saved);
    return this.mapCategory(saved);
  }

  async deleteCategory(tenantId: string, dto: CatalogCategoryDeleteDto): Promise<void> {
    await this.requireCategory(tenantId, dto.id);
    await this.repository.deleteCategory(tenantId, dto.id);
    await this.searchIndex.removeDocument(tenantId, 'category', dto.id);
  }

  async listItems(
    tenantId: string,
    filters?: { categoryId?: string; channel?: string },
  ): Promise<CatalogItemView[]> {
    await this.ensureInheritedLocalProducts(tenantId);
    let products = await this.repository.listProducts(tenantId, filters?.categoryId);
    if (filters?.channel === 'online') {
      products = products.filter((p) => isOnlineChannelVisible(p.channelVisibility));
    } else if (filters?.channel === 'pos') {
      products = products.filter((p) => isPosChannelVisible(p.channelVisibility));
    }
    return Promise.all(products.map((p) => this.mapItem(tenantId, p)));
  }

  async getItem(tenantId: string, itemId: string): Promise<CatalogItemView> {
    const product = await this.requireProduct(tenantId, itemId);
    await this.searchIndex.indexItem(product);
    return this.mapItem(tenantId, product);
  }

  async createItem(tenantId: string, dto: CatalogItemCreateDto): Promise<CatalogItemView> {
    const product = await this.repository.saveProduct(
      this.repository.createProduct({
        tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        categoryId: dto.categoryId ?? null,
        taxCategoryId: dto.taxCategoryId ?? null,
        price: dto.price,
        sku: dto.sku?.trim() ?? null,
        barcode: dto.barcode?.trim() ?? null,
        imageUrl: dto.imageUrl ?? null,
        status: dto.status ?? ProductStatus.ACTIVE,
        sortOrder: dto.sortOrder ?? 0,
        inventoryTrackingEnabled: dto.inventoryTrackingEnabled ?? false,
        stockLevel: dto.stockLevel ?? null,
        channelVisibility: dto.channelVisibility ?? { pos: true, online: true },
      }),
    );
    if (dto.modifierIds?.length) {
      await this.repository.replaceProductModifiers(tenantId, product.id, dto.modifierIds);
    }
    return this.mapItem(tenantId, product);
  }

  async updateItem(tenantId: string, dto: CatalogItemUpdateDto): Promise<CatalogItemView> {
    const product = await this.requireProduct(tenantId, dto.id);
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.description !== undefined) product.description = dto.description?.trim() ?? null;
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId ?? null;
    if (dto.taxCategoryId !== undefined) product.taxCategoryId = dto.taxCategoryId ?? null;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.sku !== undefined) product.sku = dto.sku?.trim() ?? null;
    if (dto.barcode !== undefined) product.barcode = dto.barcode?.trim() ?? null;
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.sortOrder !== undefined) product.sortOrder = dto.sortOrder;
    if (dto.inventoryTrackingEnabled !== undefined) {
      product.inventoryTrackingEnabled = dto.inventoryTrackingEnabled;
    }
    if (dto.stockLevel !== undefined) product.stockLevel = dto.stockLevel;
    if (dto.channelVisibility !== undefined) product.channelVisibility = dto.channelVisibility;
    const saved = await this.repository.saveProduct(product);
    if (dto.modifierIds !== undefined) {
      await this.repository.replaceProductModifiers(tenantId, saved.id, dto.modifierIds);
    }
    await this.searchIndex.indexItem(saved);
    return this.mapItem(tenantId, saved);
  }

  async deleteItem(tenantId: string, dto: CatalogItemDeleteDto): Promise<void> {
    await this.requireProduct(tenantId, dto.id);
    await this.repository.deleteProduct(tenantId, dto.id);
    await this.searchIndex.removeDocument(tenantId, 'item', dto.id);
  }

  async uploadItemImage(tenantId: string, dto: CatalogItemImageDto): Promise<CatalogItemView> {
    const product = await this.requireProduct(tenantId, dto.itemId);
    product.imageUrl = dto.imageUrl;
    const saved = await this.repository.saveProduct(product);
    await this.searchIndex.indexItem(saved);
    return this.mapItem(tenantId, saved);
  }

  async addVariant(tenantId: string, dto: CatalogVariantDto): Promise<CatalogVariantView> {
    await this.requireProduct(tenantId, dto.itemId);
    const saved = await this.repository.saveVariant(
      this.repository.createVariant({
        productId: dto.itemId,
        name: dto.name.trim(),
        priceDelta: dto.priceDelta ?? '0.00',
        sku: dto.sku?.trim() ?? null,
      }),
    );
    return this.mapVariant(saved);
  }

  async addModifierToItem(
    tenantId: string,
    dto: CatalogItemAddModifierDto,
  ): Promise<CatalogItemView> {
    const product = await this.requireProduct(tenantId, dto.itemId);
    let modifierId = dto.modifierId;

    if (!modifierId) {
      const modifier = await this.repository.saveModifier(
        this.repository.createModifier({
          tenantId,
          name: dto.name.trim(),
          type: dto.type ?? ModifierType.SINGLE,
          required: dto.required ?? false,
        }),
      );
      modifierId = modifier.id;
      for (const option of dto.options ?? []) {
        await this.repository.saveModifierOption(
          this.repository.createModifierOption({
            modifierId,
            name: option.name.trim(),
            priceDelta: option.priceDelta ?? '0.00',
          }),
        );
      }
    } else {
      await this.repository.findModifier(tenantId, modifierId);
    }

    await this.repository.linkProductModifier(tenantId, product.id, modifierId);
    return this.mapItem(tenantId, product);
  }

  private async mapItem(tenantId: string, product: ProductEntity): Promise<CatalogItemView> {
    const [variants, modifierIds] = await Promise.all([
      this.repository.listVariantsForProduct(product.id),
      this.repository.listModifierIdsForProduct(product.id),
    ]);

    const modifiers = await this.loadModifiersForProduct(tenantId, modifierIds);

    return {
      id: product.id,
      tenantId: product.tenantId,
      categoryId: product.categoryId,
      name: product.overrideName ?? product.globalItem?.name ?? product.name,
      description: product.overrideDescription ?? product.globalItem?.description ?? product.description,
      price: product.overridePrice ?? product.globalItem?.basePrice ?? product.price,
      sku: product.sku ?? product.globalItem?.sku ?? null,
      barcode: product.barcode ?? product.globalItem?.barcode ?? null,
      imageUrl: product.imageUrl ?? product.globalItem?.imageUrl ?? null,
      isActive: this.repository.isProductActive(product) && product.globalItem?.isActive !== false,
      status: product.status,
      sortOrder: product.sortOrder,
      inventoryTrackingEnabled: product.inventoryTrackingEnabled,
      stockLevel: product.stockLevel,
      channelVisibility: product.channelVisibility,
      taxCategoryId: product.taxCategoryId,
      variants: variants.map((v) => this.mapVariant(v)),
      modifiers,
      globalItemId: product.globalItemId,
      globalCategoryId: product.globalItem?.globalCategoryId ?? null,
      catalogSource: this.catalogSource(product),
      baseName: product.globalItem?.name ?? null,
      baseDescription: product.globalItem?.description ?? null,
      basePrice: product.globalItem?.basePrice ?? null,
      attributes: {
        ...(product.globalItem?.attributes ?? {}),
        ...(product.overrideAttributes ?? {}),
      },
      overrideAttributes: product.overrideAttributes ?? {},
    };
  }

  private async loadModifiersForProduct(
    tenantId: string,
    modifierIds: string[],
  ): Promise<CatalogModifierView[]> {
    if (!modifierIds.length) return [];
    const all = await this.repository.listModifiersForTenant(tenantId);
    const linked = all.filter((m) => modifierIds.includes(m.id));
    const options = await this.repository.listModifierOptions(linked.map((m) => m.id));
    const byModifier = new Map<string, CatalogModifierOptionView[]>();
    for (const option of options) {
      const list = byModifier.get(option.modifierId) ?? [];
      list.push({ id: option.id, name: option.name, priceDelta: option.priceDelta });
      byModifier.set(option.modifierId, list);
    }
    return linked.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      required: m.required,
      options: byModifier.get(m.id) ?? [],
    }));
  }

  private mapCategory(row: CategoryEntity): CatalogCategoryView {
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      globalCategoryId: row.globalCategoryId,
      taxCategoryId: row.taxCategoryId,
    };
  }

  private mapGlobalCategory(row: GlobalCategoryEntity): GlobalCategoryView {
    return {
      id: row.id,
      brandGroupId: row.brandGroupId,
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
    };
  }

  private async mapGlobalItemWithUsage(tenantId: string, item: GlobalItemEntity): Promise<GlobalItemView> {
    const local = (await this.repository.listProductsByGlobalIds(tenantId, [item.id]))[0];
    return {
      id: item.id,
      brandGroupId: item.brandGroupId,
      globalCategoryId: item.globalCategoryId,
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      sku: item.sku,
      barcode: item.barcode,
      taxCategoryId: item.taxCategoryId,
      imageUrl: item.imageUrl,
      attributes: item.attributes ?? {},
      isActive: item.isActive,
      localItemId: local?.id ?? null,
      overrideUsage: this.hasOverrides(local) ? 1 : 0,
    };
  }

  private catalogSource(product: ProductEntity): CatalogItemView['catalogSource'] {
    if (!product.globalItemId) return 'local';
    return this.hasOverrides(product) ? 'overridden' : 'inherited';
  }

  private hasOverrides(product?: ProductEntity): boolean {
    if (!product) return false;
    return Boolean(
      product.overrideName ||
        product.overrideDescription ||
        product.overridePrice ||
        Object.keys(product.overrideAttributes ?? {}).length,
    );
  }

  private async ensureBrandGroup(tenantId: string) {
    const tenant = await this.repository.findTenant(tenantId);
    if (!tenant) throwAdminResourceNotFound('tenant', tenantId);
    if (tenant.brandGroupId) {
      const existing = await this.repository.findBrandGroup(tenant.brandGroupId);
      if (existing) return existing;
    }
    const saved = await this.repository.saveBrandGroup(
      this.repository.createBrandGroup({
        hqTenantId: tenantId,
        name: tenant.brandName ?? tenant.name,
        brandTenantIds: [tenantId],
      }),
    );
    tenant.brandGroupId = saved.id;
    tenant.brandName = tenant.brandName ?? tenant.name;
    await this.repository.saveTenant(tenant);
    return saved;
  }

  private async ensureInheritedLocalProducts(tenantId: string): Promise<void> {
    const group = await this.ensureBrandGroup(tenantId);
    await this.ensureInheritedLocalCategories(tenantId, group.id);
    const globalItems = (await this.repository.listGlobalItems(group.id)).filter((item) => item.isActive);
    const linked = await this.repository.listProductsByGlobalIds(
      tenantId,
      globalItems.map((item) => item.id),
    );
    const linkedIds = new Set(linked.map((item) => item.globalItemId));
    for (const item of globalItems) {
      if (linkedIds.has(item.id)) continue;
      await this.ensureLocalProductForGlobalItem(tenantId, item);
    }
  }

  private async ensureInheritedLocalCategories(tenantId: string, brandGroupId?: string): Promise<void> {
    const group = brandGroupId ? await this.repository.findBrandGroup(brandGroupId) : await this.ensureBrandGroup(tenantId);
    if (!group) return;
    const globalCategories = await this.repository.listGlobalCategories(group.id);
    const linked = await this.repository.listCategoriesByGlobalIds(
      tenantId,
      globalCategories.map((category) => category.id),
    );
    const linkedIds = new Set(linked.map((category) => category.globalCategoryId));
    for (const category of globalCategories) {
      if (linkedIds.has(category.id)) continue;
      await this.ensureLocalCategoryForGlobalCategory(tenantId, category);
    }
  }

  private async ensureLocalCategoryForGlobalCategory(
    tenantId: string,
    globalCategory: GlobalCategoryEntity,
  ): Promise<CategoryEntity> {
    const existing = (await this.repository.listCategoriesByGlobalIds(tenantId, [globalCategory.id]))[0];
    if (existing) {
      existing.name = globalCategory.name;
      existing.description = globalCategory.description;
      existing.sortOrder = globalCategory.sortOrder;
      return this.repository.saveCategory(existing);
    }
    return this.repository.saveCategory(
      this.repository.createCategory({
        tenantId,
        globalCategoryId: globalCategory.id,
        name: globalCategory.name,
        description: globalCategory.description,
        sortOrder: globalCategory.sortOrder,
        isActive: true,
      }),
    );
  }

  private async ensureLocalProductForGlobalItem(
    tenantId: string,
    globalItem: GlobalItemEntity,
  ): Promise<ProductEntity> {
    const existing = (await this.repository.listProductsByGlobalIds(tenantId, [globalItem.id]))[0];
    if (existing) return existing;
    const localCategory = globalItem.globalCategoryId
      ? (await this.repository.listCategoriesByGlobalIds(tenantId, [globalItem.globalCategoryId]))[0]
      : null;
    return this.repository.saveProduct(
      this.repository.createProduct({
        tenantId,
        globalItemId: globalItem.id,
        categoryId: localCategory?.id ?? null,
        name: globalItem.name,
        description: globalItem.description,
        price: globalItem.basePrice,
        taxCategoryId: globalItem.taxCategoryId,
        sku: globalItem.sku,
        barcode: globalItem.barcode,
        imageUrl: globalItem.imageUrl,
        status: globalItem.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE,
        sortOrder: 0,
        inventoryTrackingEnabled: false,
        stockLevel: null,
        channelVisibility: { pos: true, online: true },
        overrideAttributes: {},
      }),
    );
  }

  private mapVariant(row: { id: string; productId: string; name: string; priceDelta: string; sku: string | null }) {
    return {
      id: row.id,
      itemId: row.productId,
      name: row.name,
      priceDelta: row.priceDelta,
      sku: row.sku,
    };
  }

  private async requireCategory(tenantId: string, id: string): Promise<CategoryEntity> {
    const row = await this.repository.findCategory(tenantId, id);
    if (!row) throwAdminResourceNotFound('category', id);
    return row;
  }

  private async requireGlobalCategory(brandGroupId: string, id: string): Promise<GlobalCategoryEntity> {
    const row = await this.repository.findGlobalCategory(brandGroupId, id);
    if (!row) throwAdminResourceNotFound('global category', id);
    return row;
  }

  private async requireGlobalItem(brandGroupId: string, id: string): Promise<GlobalItemEntity> {
    const row = await this.repository.findGlobalItem(brandGroupId, id);
    if (!row) throwAdminResourceNotFound('global item', id);
    return row;
  }

  private async requireProduct(tenantId: string, id: string): Promise<ProductEntity> {
    const row = await this.repository.findProduct(tenantId, id);
    if (!row) throwAdminResourceNotFound('product', id);
    return row;
  }
}
