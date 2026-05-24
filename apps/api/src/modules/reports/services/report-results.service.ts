import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { ReportResultQueryDto } from '../dto/report-results/report-result-query.dto';
import { ReportResultResponseDto } from '../dto/report-results/report-result-response.dto';

@Injectable()
export class ReportResultsService {
  findAll(
    _tenant: TenantContext,
    _query: ReportResultQueryDto,
  ): Promise<ReportResultResponseDto[]> {
    throw new NotImplementedException('findAll report results');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ReportResultResponseDto> {
    throw new NotImplementedException('findOne report result');
  }
}
