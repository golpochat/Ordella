import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto';

export class FilterPromotionConditionDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  promotionId?: string;
}
