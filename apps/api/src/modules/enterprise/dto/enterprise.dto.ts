import { IsArray, IsIn, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { EnterpriseScopeType } from '../entities';

export class CreateEnterpriseOrganizationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateEnterpriseSettingsDto {
  @IsOptional()
  @IsObject()
  globalSettings?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  taxRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  promotionPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  catalogPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ssoPolicy?: Record<string, unknown>;
}

export class CreateEnterpriseRegionDto {
  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  parentRegionId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(['country', 'state', 'custom'])
  regionType?: 'country' | 'state' | 'custom';

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsObject()
  overrides?: Record<string, unknown>;
}

export class AssignEnterpriseAccessDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsIn(['organization', 'region', 'location'])
  scopeType!: EnterpriseScopeType;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  staffRole?: string;
}

export class AssignRegionLocationsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  locationIds!: string[];
}
