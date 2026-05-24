import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class FilterReportResultDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  jobId?: string;
}
