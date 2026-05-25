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

    const request = context.switchToHttp().getRequest<{
      [CURRENT_USER_KEY]?: AuthenticatedUser;
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: Record<string, unknown>;
    }>();
    const user = request[CURRENT_USER_KEY];

    if (!user) {
      return false;
    }

    const effective = resolveRolePermissions(user.roleName ?? '', user.permissions);
    if (!required.every((permission) => permissionAllowed(effective, permission))) {
      return false;
    }

    return this.canAccessRequestedLocation(request, user);
  }

  private canAccessRequestedLocation(
    request: {
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: Record<string, unknown>;
    },
    user: AuthenticatedUser,
  ): boolean {
    const assigned = user.locationIds ?? [];
    if (assigned.length === 0 || user.roleName === 'owner' || user.roleName === 'admin') {
      return true;
    }

    const requested = this.extractLocationId(request);
    if (!requested) {
      return true;
    }

    return assigned.includes(requested);
  }

  private extractLocationId(request: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
  }): string | null {
    const candidate =
      request.params?.locationId ??
      request.query?.locationId ??
      request.body?.locationId;

    return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
  }
}
