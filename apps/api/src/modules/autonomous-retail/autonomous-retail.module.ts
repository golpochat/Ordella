import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities/product.entity';
import { EventStoreRecordEntity } from '../event-bus/entities/event-store-record.entity';
import { LocationEntity } from '../tenants/entities/location.entity';
import { AutonomousRetailController } from './controllers';
import { AUTONOMOUS_RETAIL_ENTITIES } from './entities';
import { AutonomousRetailService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([
      ...AUTONOMOUS_RETAIL_ENTITIES,
      EventStoreRecordEntity,
      ProductEntity,
      LocationEntity,
    ]),
  ],
  controllers: [AutonomousRetailController],
  providers: [AutonomousRetailService],
  exports: [AutonomousRetailService],
})
export class AutonomousRetailModule {}
