import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { INVENTORY_ENTITIES } from './entities';
import { StockItemsModule } from './modules/stock-items/stock-items.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { StockAdjustmentsModule } from './modules/stock-adjustments/stock-adjustments.module';
import { StockTransfersModule } from './modules/stock-transfers/stock-transfers.module';
import { StockReservationsModule } from './modules/stock-reservations/stock-reservations.module';
import { WastageRecordsModule } from './modules/wastage-records/wastage-records.module';
import { InventoryCoreModule } from './modules/inventory-core/inventory-core.module';

/**
 * Inventory domain — SRS §4, API Spec §4.
 *
 * Routes (/api/v1, tenant-scoped):
 * - /stock-items, /stock-movements, /stock-transfers (API Spec)
 * - /stock-adjustments, /stock-reservations, /wastage-records (SRS)
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(INVENTORY_ENTITIES),
    StockItemsModule,
    StockMovementsModule,
    StockAdjustmentsModule,
    StockTransfersModule,
    StockReservationsModule,
    WastageRecordsModule,
    InventoryCoreModule,
  ],
  exports: [InventoryCoreModule],
})
export class InventoryModule {}
