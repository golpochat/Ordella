import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto/filter-pagination.dto';

export class FilterPromotionRuleDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  promotionId?: string;
}
