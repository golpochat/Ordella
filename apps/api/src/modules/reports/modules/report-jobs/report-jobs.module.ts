import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportJobEntity } from '../../entities/report-job.entity';
import { ReportJobsController } from '../../controllers/report-jobs.controller';
import { ReportJobsService } from '../../services/report-jobs.service';
import { ReportJobRepository } from '../../repositories/report-job.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportJobEntity])],
  controllers: [ReportJobsController],
  providers: [ReportJobsService, ReportJobRepository],
  exports: [],
})
export class ReportJobsModule {}
