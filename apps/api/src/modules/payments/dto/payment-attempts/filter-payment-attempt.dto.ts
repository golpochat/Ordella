import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto';

export class FilterPaymentAttemptDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  paymentId?: string;
}
