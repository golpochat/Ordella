import { TenantStatus } from '../../enums/tenant-status.enum';

export class TenantResponseDto {
  id!: string;
  name!: string;
  status!: TenantStatus;
  slug!: string | null;
  subdomain!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
