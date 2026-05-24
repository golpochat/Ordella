import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportResultEntity } from '../../entities/report-result.entity';
import { ReportResultsController } from '../../controllers/report-results.controller';
import { ReportResultsService } from '../../services/report-results.service';
import { ReportResultRepository } from '../../repositories/report-result.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportResultEntity])],
  controllers: [ReportResultsController],
  providers: [ReportResultsService, ReportResultRepository],
  exports: [],
})
export class ReportResultsModule {}
