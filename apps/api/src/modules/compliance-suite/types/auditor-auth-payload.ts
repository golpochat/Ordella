export interface AuditorAuthPayload {
  type: 'auditor';
  sub: string;
  tenantId: string;
  email: string;
  auditorUserId: string;
}
