import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { GlobalCategoryEntity } from '../../catalog/entities/global-category.entity';
import { GlobalItemEntity } from '../../catalog/entities/global-item.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { ModifierEntity } from '../../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../../catalog/entities/modifier-option.entity';
import { ProductModifierEntity } from '../../catalog/entities/product-modifier.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { BrandGroupEntity, TenantEntity } from '../../tenants/entities';

@Injectable()
export class CatalogBuilderRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(GlobalItemEntity)
    private readonly globalItems: Repository<GlobalItemEntity>,
    @InjectRepository(GlobalCategoryEntity)
    private readonly globalCategories: Repository<GlobalCategoryEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(BrandGroupEntity)
    private readonly brandGroups: Repository<BrandGroupEntity>,
    @InjectRepository(VariantEntity)
    private readonly variants: Repository<VariantEntity>,
    @InjectRepository(ModifierEntity)
    private readonly modifiers: Repository<ModifierEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptions: Repository<ModifierOptionEntity>,
    @InjectRepository(ProductModifierEntity)
    private readonly productModifiers: Repository<ProductModifierEntity>,
  ) {}

  findTenant(tenantId: string): Promise<TenantEntity | null> {
    return this.tenants.findOne({ where: { id: tenantId } });
  }

  saveTenant(tenant: TenantEntity): Promise<TenantEntity> {
    return this.tenants.save(tenant);
  }

  createBrandGroup(partial: Partial<BrandGroupEntity>): BrandGroupEntity {
    return this.brandGroups.create(partial);
  }

  saveBrandGroup(group: BrandGroupEntity): Promise<BrandGroupEntity> {
    return this.brandGroups.save(group);
  }

  findBrandGroup(id: string): Promise<BrandGroupEntity | null> {
    return this.brandGroups.findOne({ where: { id } });
  }

  listGlobalCategories(brandGroupId: string): Promise<GlobalCategoryEntity[]> {
    return this.globalCategories.find({
      where: { brandGroupId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findGlobalCategory(brandGroupId: string, id: string): Promise<GlobalCategoryEntity | null> {
    return this.globalCategories.findOne({ where: { id, brandGroupId } });
  }

  createGlobalCategory(partial: Partial<GlobalCategoryEntity>): GlobalCategoryEntity {
    return this.globalCategories.create(partial);
  }

  saveGlobalCategory(category: GlobalCategoryEntity): Promise<GlobalCategoryEntity> {
    return this.globalCategories.save(category);
  }

  listGlobalItems(brandGroupId: string): Promise<GlobalItemEntity[]> {
    return this.globalItems.find({
      where: { brandGroupId },
      relations: ['globalCategory'],
      order: { name: 'ASC' },
    });
  }

  findGlobalItem(brandGroupId: string, id: string): Promise<GlobalItemEntity | null> {
    return this.globalItems.findOne({ where: { id, brandGroupId }, relations: ['globalCategory'] });
  }

  createGlobalItem(partial: Partial<GlobalItemEntity>): GlobalItemEntity {
    return this.globalItems.create(partial);
  }

  saveGlobalItem(item: GlobalItemEntity): Promise<GlobalItemEntity> {
    return this.globalItems.save(item);
  }

  listCategories(tenantId: string): Promise<CategoryEntity[]> {
    return this.categories.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findCategory(tenantId: string, id: string): Promise<CategoryEntity | null> {
    return this.categories.findOne({ where: { id, tenantId } });
  }

  listCategoriesByGlobalIds(tenantId: string, globalCategoryIds: string[]): Promise<CategoryEntity[]> {
    if (!globalCategoryIds.length) return Promise.resolve([]);
    return this.categories.find({ where: { tenantId, globalCategoryId: In(globalCategoryIds) } });
  }

  saveCategory(entity: CategoryEntity): Promise<CategoryEntity> {
    return this.categories.save(entity);
  }

  createCategory(partial: Partial<CategoryEntity>): CategoryEntity {
    return this.categories.create(partial);
  }

  async deleteCategory(tenantId: string, id: string): Promise<void> {
    await this.categories.delete({ id, tenantId });
  }

  listProducts(tenantId: string, categoryId?: string): Promise<ProductEntity[]> {
    return this.products.find({
      where: {
        tenantId,
        ...(categoryId ? { categoryId } : {}),
      },
      relations: ['globalItem'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  listProductsByGlobalIds(tenantId: string, globalItemIds: string[]): Promise<ProductEntity[]> {
    if (!globalItemIds.length) return Promise.resolve([]);
    return this.products.find({
      where: { tenantId, globalItemId: In(globalItemIds) },
      relations: ['globalItem'],
    });
  }

  findProduct(tenantId: string, id: string): Promise<ProductEntity | null> {
    return this.products.findOne({
      where: { id, tenantId },
      relations: ['variants', 'globalItem'],
    });
  }

  saveProduct(entity: ProductEntity): Promise<ProductEntity> {
    return this.products.save(entity);
  }

  createProduct(partial: Partial<ProductEntity>): ProductEntity {
    return this.products.create(partial);
  }

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    await this.productModifiers.delete({ tenantId, productId: id });
    await this.products.delete({ id, tenantId });
  }

  listVariantsForProduct(productId: string): Promise<VariantEntity[]> {
    return this.variants.find({ where: { productId }, order: { name: 'ASC' } });
  }

  saveVariant(entity: VariantEntity): Promise<VariantEntity> {
    return this.variants.save(entity);
  }

  createVariant(partial: Partial<VariantEntity>): VariantEntity {
    return this.variants.create(partial);
  }

  findModifier(tenantId: string, id: string): Promise<ModifierEntity | null> {
    return this.modifiers.findOne({ where: { id, tenantId } });
  }

  saveModifier(entity: ModifierEntity): Promise<ModifierEntity> {
    return this.modifiers.save(entity);
  }

  createModifier(partial: Partial<ModifierEntity>): ModifierEntity {
    return this.modifiers.create(partial);
  }

  saveModifierOption(entity: ModifierOptionEntity): Promise<ModifierOptionEntity> {
    return this.modifierOptions.save(entity);
  }

  createModifierOption(partial: Partial<ModifierOptionEntity>): ModifierOptionEntity {
    return this.modifierOptions.create(partial);
  }

  listModifierOptions(modifierIds: string[]): Promise<ModifierOptionEntity[]> {
    if (!modifierIds.length) return Promise.resolve([]);
    return this.modifierOptions.find({
      where: { modifierId: In(modifierIds) },
      order: { name: 'ASC' },
    });
  }

  listModifiersForTenant(tenantId: string): Promise<ModifierEntity[]> {
    return this.modifiers.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async listModifierIdsForProduct(productId: string): Promise<string[]> {
    const rows = await this.productModifiers.find({ where: { productId } });
    return rows.map((row) => row.modifierId);
  }

  async replaceProductModifiers(
    tenantId: string,
    productId: string,
    modifierIds: string[],
  ): Promise<void> {
    await this.productModifiers.delete({ productId });
    if (!modifierIds.length) return;
    await this.productModifiers.save(
      modifierIds.map((modifierId) =>
        this.productModifiers.create({ tenantId, productId, modifierId }),
      ),
    );
  }

  async linkProductModifier(
    tenantId: string,
    productId: string,
    modifierId: string,
  ): Promise<void> {
    const existing = await this.productModifiers.findOne({ where: { productId, modifierId } });
    if (existing) return;
    await this.productModifiers.save(
      this.productModifiers.create({ tenantId, productId, modifierId }),
    );
  }

  isProductActive(product: ProductEntity): boolean {
    return product.status === ProductStatus.ACTIVE;
  }
}
