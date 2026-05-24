import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WastageRecordEntity } from '../../entities/wastage-record.entity';
import { WastageRecordsController } from '../../controllers/wastage-records.controller';
import { WastageRecordsService } from '../../services/wastage-records.service';
import { WastageRecordRepository } from '../../repositories/wastage-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WastageRecordEntity])],
  controllers: [WastageRecordsController],
  providers: [WastageRecordsService, WastageRecordRepository],
  exports: [],
})
export class WastageRecordsModule {}
