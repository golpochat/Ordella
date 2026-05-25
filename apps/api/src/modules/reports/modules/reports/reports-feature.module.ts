import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ReportDefinitionEntity,
  ReportEntity,
  ReportEventEntity,
  ReportJobEntity,
  ReportResultEntity,
  ReportSnapshotEntity,
} from '../../entities';
import { ReportsController } from '../../controllers';
import { ReportsAnalyticsService, ReportsService } from '../../services';
import { ReportRepository } from '../../repositories/report.repository';
import { CsvExportService } from '../../integrations';
import { OrderEntity, OrderItemEntity } from '../../../orders/entities';
import { ProductEntity, CategoryEntity } from '../../../catalog/entities';
import { StockItemEntity, StockMovementEntity, WastageRecordEntity } from '../../../inventory/entities';
import { OrderTaxLineEntity } from '../../../tax/entities/order-tax-line.entity';
import { CustomerEntity, LoyaltyTransactionEntity } from '../../../loyalty/entities';
import { DeliveryTaskEntity } from '../../../deliveries/entities';
import { WarehousePickTaskEntity } from '../../../warehouse/entities';
import { PurchaseOrderEntity } from '../../../procurement/entities';
import { LocationEntity } from '../../../tenants/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEntity,
      ReportDefinitionEntity,
      ReportEventEntity,
      ReportJobEntity,
      ReportResultEntity,
      ReportSnapshotEntity,
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
      CategoryEntity,
      StockItemEntity,
      StockMovementEntity,
      WastageRecordEntity,
      OrderTaxLineEntity,
      CustomerEntity,
      LoyaltyTransactionEntity,
      DeliveryTaskEntity,
      WarehousePickTaskEntity,
      PurchaseOrderEntity,
      LocationEntity,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsAnalyticsService, ReportsService, ReportRepository, CsvExportService],
  exports: [],
})
export class ReportsFeatureModule {}
