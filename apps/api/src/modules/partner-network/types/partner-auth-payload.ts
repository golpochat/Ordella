export interface PartnerAuthPayload {
  type: 'partner';
  sub: string;
  tenantId: string;
  email: string;
  partnerId: string;
  partnerUserId: string;
  sessionId?: string;
}

