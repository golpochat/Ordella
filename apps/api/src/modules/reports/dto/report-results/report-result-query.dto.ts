import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class ReportResultQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  jobId?: string;
}
