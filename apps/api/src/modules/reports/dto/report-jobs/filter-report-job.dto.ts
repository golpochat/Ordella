import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class FilterReportJobDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  reportId?: string;
}
