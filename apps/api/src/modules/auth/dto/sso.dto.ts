import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SsoProviderType } from '../enums/sso-provider-type.enum';

export class UpsertSsoProviderDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(SsoProviderType)
  providerType!: SsoProviderType;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  issuerUrl?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  metadataUrl?: string;

  @IsOptional()
  @IsString()
  authorizationUrl?: string;

  @IsOptional()
  @IsString()
  tokenUrl?: string;

  @IsOptional()
  @IsString()
  jwksUri?: string;

  @IsOptional()
  @IsString()
  defaultRole?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SsoLoginDto {
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class SsoCallbackDto {
  @IsUUID()
  providerId!: string;

  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  samlResponse?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  nonce?: string;

  @IsOptional()
  @IsObject()
  profile?: Record<string, unknown>;
}

export class RoleMappingDto {
  @IsString()
  @MinLength(1)
  externalRole!: string;

  @IsString()
  @MinLength(1)
  internalRole!: string;

  @IsOptional()
  @IsUUID()
  providerId?: string;
}

export class UpdateRoleMappingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleMappingDto)
  mappings!: RoleMappingDto[];
}
