import { StoreStatus } from '../../enums/store-status.enum';

export class StoreResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  slug!: string | null;
  status!: StoreStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
