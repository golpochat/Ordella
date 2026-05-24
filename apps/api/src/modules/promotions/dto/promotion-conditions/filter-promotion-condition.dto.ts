import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class FilterPromotionConditionDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  promotionId?: string;
}
