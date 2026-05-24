import { PromotionApplicationStatus } from '../../enums/promotion-application-status.enum';

export class PromotionApplicationResponseDto {
  id!: string;
  promotionId!: string;
  tenantId!: string;
  orderId!: string | null;
  customerId!: string | null;
  discountAmount!: string;
  status!: PromotionApplicationStatus;
  appliedAt!: Date;
  createdAt!: Date;
  updatedAt!: Date | null;
}
