import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { CURRENT_USER_KEY } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * RBAC guard — checks @RequirePermissions() metadata against user.permissions.
 * TODO: implement permission resolution from role_permissions join.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ [CURRENT_USER_KEY]?: AuthenticatedUser }>();
    const user = request[CURRENT_USER_KEY];

    if (!user) {
      return false;
    }

    // TODO: enforce permission checks when AuthenticationService populates permissions
    return required.every((permission) => user.permissions.includes(permission));
  }
}
