import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StockItemEntity } from '../inventory/entities';
import { TenantSettingsEntity } from '../onboarding/entities/tenant-settings.entity';
import { OrderEntity } from '../orders/entities';
import { LocationEntity } from '../tenants/entities';
import { RoutingController } from './controllers';
import { ROUTING_ENTITIES } from './entities';
import { RoutingService } from './services';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ...ROUTING_ENTITIES,
      LocationEntity,
      StockItemEntity,
      OrderEntity,
      TenantSettingsEntity,
    ]),
  ],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService, TypeOrmModule],
})
export class RoutingModule {}
