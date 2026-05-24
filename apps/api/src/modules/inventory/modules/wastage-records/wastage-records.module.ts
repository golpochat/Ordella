import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WastageRecordEntity } from '../../entities';
import { WastageRecordsController } from '../../controllers';
import { WastageRecordsService } from '../../services';
import { WastageRecordRepository } from '../../repositories/wastage-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WastageRecordEntity])],
  controllers: [WastageRecordsController],
  providers: [WastageRecordsService, WastageRecordRepository],
  exports: [],
})
export class WastageRecordsModule {}
