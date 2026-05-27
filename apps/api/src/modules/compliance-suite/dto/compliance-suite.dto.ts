import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpsertSecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  mfaEnforced?: boolean;

  @IsOptional()
  @IsObject()
  passwordPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  sessionPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  deviceTrustRules?: unknown[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipAllowlist?: string[];

  @IsOptional()
  @IsObject()
  ssoConfig?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  scimEnabled?: boolean;
}

export class UpsertDataGovernanceDto {
  @IsOptional()
  @IsArray()
  classificationRules?: unknown[];

  @IsOptional()
  @IsObject()
  piiMasking?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  encryptionPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  retentionRules?: unknown[];

  @IsOptional()
  @IsObject()
  residencyPolicy?: Record<string, unknown>;
}

export class CreateRiskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  likelihood?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  impact?: number;
}

export class UploadEvidenceDto {
  @IsOptional()
  @IsUUID()
  controlId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  storageUri?: string;

  @IsOptional()
  @IsString()
  evidenceType?: string;
}

export class SavePolicyDto {
  @IsString()
  policyKey!: string;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}

export class CreateIncidentDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;
}

export class UpdateIncidentDto {
  @IsOptional()
  @IsIn(['open', 'investigating', 'contained', 'resolved', 'closed'])
  status?: string;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RunControlTestsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  controlIds?: string[];
}

export class GenerateExportReportDto {
  @IsIn(['soc2', 'iso27001', 'pci', 'gdpr', 'full_audit', 'security_questionnaire'])
  reportType!: string;

  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv';
}

export class AuditorLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class CreateAuditorUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class RecordDataAccessDto {
  @IsString()
  resourceType!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  classification?: string;
}
