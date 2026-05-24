import { AddonEntity } from './addon.entity';
import { CategoryEntity } from './category.entity';
import { ModifierOptionEntity } from './modifier-option.entity';
import { ModifierEntity } from './modifier.entity';
import { ProductEntity } from './product.entity';
import { VariantEntity } from './variant.entity';

export { AddonEntity } from './addon.entity';
export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { CategoryEntity } from './category.entity';
export { ModifierOptionEntity } from './modifier-option.entity';
export { ModifierEntity } from './modifier.entity';
export { ProductEntity } from './product.entity';
export { VariantEntity } from './variant.entity';

export const CATALOG_ENTITIES = [
  AddonEntity,
  CategoryEntity,
  ModifierOptionEntity,
  ModifierEntity,
  ProductEntity,
  VariantEntity,
];
