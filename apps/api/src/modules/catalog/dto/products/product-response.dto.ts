import { ProductStatus } from '../../enums/product-status.enum';

export class ProductResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  description!: string | null;
  categoryId!: string | null;
  price!: string;
  status!: ProductStatus;
  sortOrder!: number;
  channelVisibility!: Record<string, boolean>;
  createdAt!: Date;
  updatedAt!: Date | null;
}
