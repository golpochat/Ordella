import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit';
import { UserEntity } from '../auth/entities';
import { DeliveryTaskEntity } from '../deliveries/entities';
import { StockItemEntity } from '../inventory/entities';
import { OrderEntity } from '../orders/entities';
import { LocationEntity, TenantEntity, UserLocationAssignmentEntity } from '../tenants/entities';
import { EnterpriseController } from './controllers/enterprise.controller';
import { ENTERPRISE_ENTITIES } from './entities';
import { EnterpriseService } from './services/enterprise.service';

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature([
      ...ENTERPRISE_ENTITIES,
      TenantEntity,
      LocationEntity,
      UserLocationAssignmentEntity,
      UserEntity,
      OrderEntity,
      StockItemEntity,
      DeliveryTaskEntity,
    ]),
  ],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
