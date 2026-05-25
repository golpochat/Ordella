import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../../../tenants/entities';
import { NotificationsModule } from '../../../notifications/notifications.module';
import { StockItemEntity, StockMovementEntity, StockTransferEntity, StockTransferLineEntity } from '../../entities';
import { StockTransfersController } from '../../controllers';
import { StockTransfersService } from '../../services';
import { StockTransferRepository } from '../../repositories/stock-transfer.repository';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      StockTransferEntity,
      StockTransferLineEntity,
      StockItemEntity,
      StockMovementEntity,
      LocationEntity,
    ]),
  ],
  controllers: [StockTransfersController],
  providers: [StockTransfersService, StockTransferRepository],
  exports: [StockTransfersService],
})
export class StockTransfersModule {}
