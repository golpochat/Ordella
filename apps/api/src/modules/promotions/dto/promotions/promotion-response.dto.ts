import { PromotionStatus } from '../../enums/promotion-status.enum';
import { PromotionType } from '../../enums/promotion-type.enum';

export class PromotionResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  type!: PromotionType;
  value!: string;
  startDate!: Date | null;
  endDate!: Date | null;
  status!: PromotionStatus;
  code!: string | null;
  usageLimit!: number | null;
  usageCount!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
