import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class ReportJobQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  reportId?: string;
}
