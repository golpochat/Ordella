import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CATALOG_ENTITIES } from './entities';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { VariantsModule } from './modules/variants/variants.module';
import { ModifiersModule } from './modules/modifiers/modifiers.module';
import { AddonsModule } from './modules/addons/addons.module';

/**
 * Catalog domain — SRS §3, API Spec §3 (architecture blueprint §2.2 Catalog Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /categories, /products, /variants, /modifiers, /addons
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(CATALOG_ENTITIES),
    CategoriesModule,
    ProductsModule,
    VariantsModule,
    ModifiersModule,
    AddonsModule,
  ],
  exports: [
    CategoriesModule,
    ProductsModule,
    VariantsModule,
    ModifiersModule,
    AddonsModule,
    TypeOrmModule,
  ],
})
export class CatalogModule {}
