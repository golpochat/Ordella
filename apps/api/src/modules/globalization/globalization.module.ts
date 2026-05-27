import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { TenantSettingsEntity } from '../onboarding/entities/tenant-settings.entity';
import { LocationEntity } from '../tenants/entities/location.entity';
import { TaxModule } from '../tax/tax.module';
import { GlobalizationController } from './controllers';
import { GLOBALIZATION_ENTITIES } from './entities';
import { GlobalizationService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TaxModule,
    TypeOrmModule.forFeature([...GLOBALIZATION_ENTITIES, TenantSettingsEntity, LocationEntity]),
  ],
  controllers: [GlobalizationController],
  providers: [GlobalizationService],
  exports: [GlobalizationService],
})
export class GlobalizationModule {}
