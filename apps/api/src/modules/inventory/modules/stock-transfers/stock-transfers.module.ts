import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransferEntity } from '../../entities/stock-transfer.entity';
import { StockTransferLineEntity } from '../../entities/stock-transfer-line.entity';
import { StockTransfersController } from '../../controllers/stock-transfers.controller';
import { StockTransfersService } from '../../services/stock-transfers.service';
import { StockTransferRepository } from '../../repositories/stock-transfer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockTransferEntity, StockTransferLineEntity])],
  controllers: [StockTransfersController],
  providers: [StockTransfersService, StockTransferRepository],
  exports: [StockTransfersService, StockTransferRepository],
})
export class StockTransfersModule {}
