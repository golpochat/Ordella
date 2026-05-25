export type CustomerAuthPayload = {
  sub: string;
  tenantId: string;
  email: string;
  type: 'customer';
};
