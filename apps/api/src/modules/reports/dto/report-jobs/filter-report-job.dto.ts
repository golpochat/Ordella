import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto';

export class FilterReportJobDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  reportId?: string;
}
