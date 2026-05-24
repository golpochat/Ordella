import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';
import { PromotionApplicationStatus } from '../../enums/promotion-application-status.enum';

export class PromotionApplicationQueryDto extends PaginationQueryDto {
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
