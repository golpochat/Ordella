import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { DeliveryTaskEntity } from '../deliveries/entities';
import { StockItemEntity } from '../inventory/entities';
import { OrderEntity } from '../orders/entities';
import { LocationEntity } from '../tenants/entities/location.entity';
import { OfflineSyncController } from './controllers';
import { OFFLINE_SYNC_ENTITIES } from './entities';
import { OfflineSyncService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([
      ...OFFLINE_SYNC_ENTITIES,
      DeliveryTaskEntity,
      LocationEntity,
      OrderEntity,
      ProductEntity,
      StockItemEntity,
    ]),
  ],
  controllers: [OfflineSyncController],
  providers: [OfflineSyncService],
  exports: [OfflineSyncService],
})
export class OfflineSyncModule {}
