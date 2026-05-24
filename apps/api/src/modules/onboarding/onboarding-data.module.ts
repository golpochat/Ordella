import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_ENTITIES } from '../auth/entities';
import { OrderEntity } from '../orders/entities/order.entity';
import { TENANTS_ENTITIES } from '../tenants/entities';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ONBOARDING_ENTITIES } from './entities';
import { OnboardingRepository } from './repositories/onboarding.repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...ONBOARDING_ENTITIES,
      ...AUTH_ENTITIES,
      ...TENANTS_ENTITIES,
      CategoryEntity,
      ProductEntity,
      OrderEntity,
    ]),
  ],
  providers: [OnboardingRepository],
  exports: [OnboardingRepository, TypeOrmModule],
})
export class OnboardingDataModule {}
