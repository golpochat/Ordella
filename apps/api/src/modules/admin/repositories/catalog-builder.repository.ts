import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { ModifierEntity } from '../../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../../catalog/entities/modifier-option.entity';
import { ProductModifierEntity } from '../../catalog/entities/product-modifier.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';

@Injectable()
export class CatalogBuilderRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variants: Repository<VariantEntity>,
    @InjectRepository(ModifierEntity)
    private readonly modifiers: Repository<ModifierEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptions: Repository<ModifierOptionEntity>,
    @InjectRepository(ProductModifierEntity)
    private readonly productModifiers: Repository<ProductModifierEntity>,
  ) {}

  listCategories(tenantId: string): Promise<CategoryEntity[]> {
    return this.categories.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findCategory(tenantId: string, id: string): Promise<CategoryEntity | null> {
    return this.categories.findOne({ where: { id, tenantId } });
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
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findProduct(tenantId: string, id: string): Promise<ProductEntity | null> {
    return this.products.findOne({
      where: { id, tenantId },
      relations: ['variants'],
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
