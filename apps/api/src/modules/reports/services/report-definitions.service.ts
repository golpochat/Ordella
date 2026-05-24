import { Injectable, NotImplementedException } from '@nestjs/common';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateReportDefinitionDto } from '../dto/report-definitions/create-report-definition.dto';
import { ReportDefinitionResponseDto } from '../dto/report-definitions/report-definition-response.dto';
import { UpdateReportDefinitionDto } from '../dto/report-definitions/update-report-definition.dto';

@Injectable()
export class ReportDefinitionsService {
  findAll(_query: PaginationQueryDto): Promise<ReportDefinitionResponseDto[]> {
    throw new NotImplementedException('findAll report definitions');
  }

  create(_dto: CreateReportDefinitionDto): Promise<ReportDefinitionResponseDto> {
    throw new NotImplementedException('create report definition');
  }

  findOne(_id: string): Promise<ReportDefinitionResponseDto> {
    throw new NotImplementedException('findOne report definition');
  }

  update(_id: string, _dto: UpdateReportDefinitionDto): Promise<ReportDefinitionResponseDto> {
    throw new NotImplementedException('update report definition');
  }
}
