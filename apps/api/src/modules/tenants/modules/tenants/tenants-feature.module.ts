import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../../entities/tenant.entity';
import { TenantsController } from '../../controllers/tenants.controller';
import { TenantsService } from '../../services/tenants.service';
import { TenantRepository } from '../../repositories/tenant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantRepository],
  exports: [TenantsService, TenantRepository, TypeOrmModule],
})
export class TenantsFeatureModule {}
