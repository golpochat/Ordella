import { PermissionKeys } from '../../modules/auth/constants';

/**
 * Placeholder seed data for the global permissions catalog.
 * TODO: implement TypeORM seed runner.
 */
const PERMISSION_DESCRIPTIONS: Partial<Record<string, string>> = {
  'products:read': 'View catalog items',
  'products:create': 'Create catalog items',
  'products:update': 'Update catalog items',
  'products:delete': 'Delete catalog items',
  'kds:read': 'View fulfillment display queue',
  'kds:update': 'Update fulfillment display tickets',
  'pos:access': 'Access in-store POS',
};

export const AUTH_PERMISSIONS_SEED = Object.values(PermissionKeys).map((key) => ({
  key,
  description: PERMISSION_DESCRIPTIONS[key] ?? `Permission: ${key}`,
}));
