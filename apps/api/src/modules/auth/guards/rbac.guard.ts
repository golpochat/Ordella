import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';
import { CURRENT_USER_KEY } from '../../../common/decorators';
import { AuthenticatedUser } from '../../../common/interfaces';
import { permissionAllowed, resolveRolePermissions } from '../../../common/rbac/role-permissions';

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

    const effective = resolveRolePermissions(user.roleName ?? '', user.permissions);
    return required.every((permission) => permissionAllowed(effective, permission));
  }
}
