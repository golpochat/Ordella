import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class PromotionConditionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  promotionId?: string;
}
