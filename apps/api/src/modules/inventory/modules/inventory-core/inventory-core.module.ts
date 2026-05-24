import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  StockAdjustmentEntity,
  StockItemEntity,
  StockMovementEntity,
  StockReservationEntity,
} from '../../entities';
import { InventoryService } from '../../services/inventory.service';
import { StockItemRepository } from '../../repositories/stock-item.repository';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';
import { StockAdjustmentRepository } from '../../repositories/stock-adjustment.repository';
import { StockReservationRepository } from '../../repositories/stock-reservation.repository';
import {
  AutoReplenishmentService,
  LowStockAlertsService,
  SupplierOrderingService,
} from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockItemEntity,
      StockMovementEntity,
      StockAdjustmentEntity,
      StockReservationEntity,
    ]),
  ],
  providers: [
    InventoryService,
    StockItemRepository,
    StockMovementRepository,
    StockAdjustmentRepository,
    StockReservationRepository,
    LowStockAlertsService,
    AutoReplenishmentService,
    SupplierOrderingService,
  ],
  exports: [InventoryService],
})
export class InventoryCoreModule {}
