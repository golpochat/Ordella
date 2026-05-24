import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransferEntity } from '../../entities';
import { StockTransferLineEntity } from '../../entities';
import { StockTransfersController } from '../../controllers';
import { StockTransfersService } from '../../services';
import { StockTransferRepository } from '../../repositories/stock-transfer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockTransferEntity, StockTransferLineEntity])],
  controllers: [StockTransfersController],
  providers: [StockTransfersService, StockTransferRepository],
  exports: [],
})
export class StockTransfersModule {}
