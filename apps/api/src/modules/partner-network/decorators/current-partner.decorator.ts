import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PartnerAuthPayload } from '../types/partner-auth-payload';

export const PARTNER_AUTH_KEY = 'partnerAuth';

export const CurrentPartner = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PartnerAuthPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [PARTNER_AUTH_KEY]?: PartnerAuthPayload }>();
    return request[PARTNER_AUTH_KEY];
  },
);

