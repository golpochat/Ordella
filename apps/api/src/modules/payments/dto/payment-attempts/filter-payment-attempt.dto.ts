import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class FilterPaymentAttemptDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  paymentId?: string;
}
