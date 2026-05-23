import { SessionStatus } from '../../enums/session-status.enum';

/** API Spec §1.8 Sessions API */
export class SessionResponseDto {
  id!: string;
  tenantId!: string;
  userId!: string;
  deviceId!: string | null;
  status!: SessionStatus;
  expiresAt!: Date;
  lastActiveAt!: Date | null;
  ipAddress!: string | null;
  userAgent!: string | null;
  createdAt!: Date;
}
