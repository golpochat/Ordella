import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class PaymentAttemptQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  paymentId?: string;
}
