import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportResultEntity } from '../../entities';
import { ReportResultsController } from '../../controllers';
import { ReportResultsService } from '../../services';
import { ReportResultRepository } from '../../repositories/report-result.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportResultEntity])],
  controllers: [ReportResultsController],
  providers: [ReportResultsService, ReportResultRepository],
  exports: [],
})
export class ReportResultsModule {}
