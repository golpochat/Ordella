import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterReportJobDto } from '../dto/report-jobs/filter-report-job.dto';
import { ReportJobResponseDto } from '../dto/report-jobs/report-job-response.dto';

@Injectable()
export class ReportJobsService {
  findAll(_tenant: TenantContext, _query: FilterReportJobDto): Promise<ReportJobResponseDto[]> {
    throw new NotImplementedException('findAll report jobs');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ReportJobResponseDto> {
    throw new NotImplementedException('findOne report job');
  }
}
