import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { VerifiedApiKey } from '../services/api-keys.service';

export const API_KEY_CONTEXT_KEY = 'apiKeyContext';

export const CurrentApiKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): VerifiedApiKey | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [API_KEY_CONTEXT_KEY]?: VerifiedApiKey }>();
    return request[API_KEY_CONTEXT_KEY];
  },
);
