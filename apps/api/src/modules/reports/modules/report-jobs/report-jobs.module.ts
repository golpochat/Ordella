import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportJobEntity } from '../../entities';
import { ReportJobsController } from '../../controllers';
import { ReportJobsService } from '../../services';
import { ReportJobRepository } from '../../repositories/report-job.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportJobEntity])],
  controllers: [ReportJobsController],
  providers: [ReportJobsService, ReportJobRepository],
  exports: [],
})
export class ReportJobsModule {}
