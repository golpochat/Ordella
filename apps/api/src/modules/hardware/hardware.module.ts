import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit';
import { AuthModule } from '../auth/auth.module';
import { InventoryCoreModule } from '../inventory/modules/inventory-core/inventory-core.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LocationEntity } from '../tenants/entities';
import { HardwareController } from './controllers/hardware.controller';
import { HARDWARE_ENTITIES } from './entities';
import { HardwareGateway } from './gateways/hardware.gateway';
import { HardwareService } from './services/hardware.service';

@Module({
  imports: [
    AuditModule,
    AuthModule,
    InventoryCoreModule,
    NotificationsModule,
    TypeOrmModule.forFeature([...HARDWARE_ENTITIES, LocationEntity]),
  ],
  controllers: [HardwareController],
  providers: [HardwareGateway, HardwareService],
  exports: [HardwareService],
})
export class HardwareModule {}
