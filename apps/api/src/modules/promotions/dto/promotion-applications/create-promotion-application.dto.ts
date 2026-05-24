import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PromotionApplicationStatus } from '../../enums/promotion-application-status.enum';

export class CreatePromotionApplicationDto {
  @IsUUID()
  promotionId!: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  discountAmount!: string;

  @IsOptional()
  @IsEnum(PromotionApplicationStatus)
  status?: PromotionApplicationStatus;
}
