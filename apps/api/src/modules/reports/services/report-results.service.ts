import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterReportResultDto } from '../dto';
import { ReportResultResponseDto } from '../dto';

@Injectable()
export class ReportResultsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterReportResultDto,
  ): Promise<ReportResultResponseDto[]> {
    throw new NotImplementedException('findAll report results');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<ReportResultResponseDto> {
    throw new NotImplementedException('findOne report result');
  }
}
