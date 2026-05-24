import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../../entities';
import { TenantsController } from '../../controllers';
import { TenantsService } from '../../services';
import { TenantRepository } from '../../repositories/tenant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantRepository],
  exports: [],
})
export class TenantsFeatureModule {}
