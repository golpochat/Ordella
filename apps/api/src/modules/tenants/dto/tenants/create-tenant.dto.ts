import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { TenantStatus } from '../../enums/tenant-status.enum';

/** API Spec §2.1 POST /api/v1/tenants */
export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  subdomain?: string;
}
