import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities/product.entity';
import { EventStoreRecordEntity } from '../event-bus/entities/event-store-record.entity';
import { CustomerEntity } from '../loyalty/entities';
import { OrderEntity } from '../orders/entities/order.entity';
import { LocationEntity } from '../tenants/entities/location.entity';
import { DataLakeController } from './controllers';
import { DATA_LAKE_ENTITIES } from './entities';
import { DataLakeService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([
      ...DATA_LAKE_ENTITIES,
      EventStoreRecordEntity,
      OrderEntity,
      CustomerEntity,
      ProductEntity,
      LocationEntity,
    ]),
  ],
  controllers: [DataLakeController],
  providers: [DataLakeService],
  exports: [DataLakeService],
})
export class DataLakeModule {}
