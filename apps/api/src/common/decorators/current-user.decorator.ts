import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';

export const CURRENT_USER_KEY = 'user';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [CURRENT_USER_KEY]?: AuthenticatedUser }>();
    return request[CURRENT_USER_KEY];
  },
);
