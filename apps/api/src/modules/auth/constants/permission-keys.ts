/**
 * RBAC permission keys (placeholder catalog).
 * Seed into `permissions` table — align with @RequirePermissions() decorators.
 */
export const PermissionKeys = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_ASSIGN: 'roles:assign',
  PERMISSIONS_READ: 'permissions:read',
  API_KEYS_READ: 'api-keys:read',
  API_KEYS_CREATE: 'api-keys:create',
  API_KEYS_DELETE: 'api-keys:delete',
} as const;
