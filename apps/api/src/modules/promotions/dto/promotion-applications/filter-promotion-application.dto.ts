import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';
import { PromotionApplicationStatus } from '../../enums/promotion-application-status.enum';

export class FilterPromotionApplicationDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  promotionId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsEnum(PromotionApplicationStatus)
  status?: PromotionApplicationStatus;
}
