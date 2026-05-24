import { Injectable, NotImplementedException } from '@nestjs/common';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateReportDefinitionDto } from '../dto';
import { ReportDefinitionResponseDto } from '../dto';
import { UpdateReportDefinitionDto } from '../dto';

@Injectable()
export class ReportDefinitionsService {
  findAll(_query: FilterPaginationDto): Promise<ReportDefinitionResponseDto[]> {
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
