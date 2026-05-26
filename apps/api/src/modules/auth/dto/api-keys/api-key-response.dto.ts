export class ApiKeyResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  keyPrefix!: string;
  scopes!: string[];
  key?: string;
  rateLimitPerMinute!: number;
  ipAllowlist!: string[];
  isActive!: boolean;
  expiresAt!: Date | null;
  lastUsedAt!: Date | null;
  createdAt!: Date;
}
