import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { CategoryEntity } from '../../../catalog/entities/category.entity';
import { OrderItemEntity } from '../../../orders/entities/order-item.entity';
import { OrderEntity } from '../../../orders/entities/order.entity';
import { LocationEntity } from '../../../tenants/entities';
import {
  InventorySnapshotEntity,
  InventorySyncLogEntity,
  StockAdjustmentEntity,
  StockItemEntity,
  StockMovementEntity,
  StockReservationEntity,
} from '../../entities';
import { InventoryService } from '../../services/inventory.service';
import { InventoryManagementService } from '../../services/inventory-management.service';
import { StockItemRepository } from '../../repositories/stock-item.repository';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { StockAdjustmentRepository } from '../../repositories/stock-adjustment.repository';
import { StockReservationRepository } from '../../repositories/stock-reservation.repository';
import { InventoryQueryRepository } from '../../repositories/inventory-query.repository';
import {
  AutoReplenishmentService,
  LowStockAlertsService,
  SupplierOrderingService,
} from '../../integrations';
import { SearchModule } from '../../../search';

@Module({
  imports: [
    SearchModule,
    TypeOrmModule.forFeature([
      StockItemEntity,
      InventorySnapshotEntity,
      InventorySyncLogEntity,
      StockMovementEntity,
      StockAdjustmentEntity,
      StockReservationEntity,
      ProductEntity,
      CategoryEntity,
      OrderItemEntity,
      OrderEntity,
      LocationEntity,
    ]),
  ],
  providers: [
    InventoryService,
    InventoryManagementService,
    InventoryQueryRepository,
    StockItemRepository,
    StockMovementRepository,
    StockAdjustmentRepository,
    StockReservationRepository,
    LowStockAlertsService,
    AutoReplenishmentService,
    SupplierOrderingService,
  ],
  exports: [InventoryService, InventoryManagementService, InventoryQueryRepository],
})
export class InventoryCoreModule {}
