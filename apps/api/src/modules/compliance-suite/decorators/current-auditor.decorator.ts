import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuditorAuthPayload } from '../types/auditor-auth-payload';

export const AUDITOR_AUTH_KEY = 'auditorAuth';

export const CurrentAuditor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditorAuthPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [AUDITOR_AUTH_KEY]?: AuditorAuthPayload }>();
    return request[AUDITOR_AUTH_KEY];
  },
);
