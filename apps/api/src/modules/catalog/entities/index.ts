import { AddonEntity } from './addon.entity';
import { CategoryEntity } from './category.entity';
import { ModifierOptionEntity } from './modifier-option.entity';
import { ModifierEntity } from './modifier.entity';
import { ProductModifierEntity } from './product-modifier.entity';
import { ProductEntity } from './product.entity';
import { GlobalCategoryEntity } from './global-category.entity';
import { GlobalItemEntity } from './global-item.entity';
import { VariantEntity } from './variant.entity';

export { AddonEntity } from './addon.entity';
export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { CategoryEntity } from './category.entity';
export { ModifierOptionEntity } from './modifier-option.entity';
export { ModifierEntity } from './modifier.entity';
export { ProductEntity } from './product.entity';
export { GlobalCategoryEntity } from './global-category.entity';
export { GlobalItemEntity } from './global-item.entity';
export { ProductModifierEntity } from './product-modifier.entity';
export { VariantEntity } from './variant.entity';

export const CATALOG_ENTITIES = [
  AddonEntity,
  CategoryEntity,
  ModifierOptionEntity,
  ModifierEntity,
  ProductModifierEntity,
  ProductEntity,
  GlobalCategoryEntity,
  GlobalItemEntity,
  VariantEntity,
];
