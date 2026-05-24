import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto/filter-pagination.dto';

export class FilterReportResultDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  jobId?: string;
}
