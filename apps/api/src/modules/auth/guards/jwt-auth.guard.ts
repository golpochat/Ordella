import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CURRENT_USER_KEY } from '../../../common/decorators';

/**
 * JWT authentication guard (placeholder).
 * TODO: wire Passport JWT strategy and attach AuthenticatedUser + tenant from token claims.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // TODO: return super.canActivate(context) when JwtStrategy is implemented
    const request = context.switchToHttp().getRequest();
    if (!request[CURRENT_USER_KEY]) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    return true;
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }
    return user;
  }
}
