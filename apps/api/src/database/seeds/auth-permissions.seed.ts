import { PermissionKeys } from '../../modules/auth/constants';

/**
 * Placeholder seed data for the global permissions catalog.
 * TODO: implement TypeORM seed runner.
 */
export const AUTH_PERMISSIONS_SEED = Object.values(PermissionKeys).map((key) => ({
  key,
  description: `Permission: ${key}`,
}));
