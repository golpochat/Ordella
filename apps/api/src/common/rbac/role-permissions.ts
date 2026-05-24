export const SystemRoleNames = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
} as const;

export const OnboardingPermissionKeys = {
  TENANT_SETTINGS_READ: 'tenant:settings:read',
  TENANT_SETTINGS_UPDATE: 'tenant:settings:update',
  TENANT_BRANDING_UPDATE: 'tenant:branding:update',
  TENANT_BILLING_READ: 'tenant:billing:read',
  TENANT_BILLING_UPDATE: 'tenant:billing:update',
  ONBOARDING_READ: 'onboarding:read',
  ONBOARDING_UPDATE: 'onboarding:update',
  STAFF_READ: 'staff:read',
  STAFF_INVITE: 'staff:invite',
  STAFF_UPDATE: 'staff:update',
} as const;

const CATALOG = [
  'tenants:read',
  'tenants:create',
  'tenants:update',
  'tenants:delete',
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:assign',
  'permissions:read',
  'products:read',
  'products:create',
  'products:update',
  'products:delete',
  'categories:read',
  'categories:create',
  'categories:update',
  'orders:read',
  'orders:update',
  'inventory:read',
  'inventory:update',
  'pos:access',
  'kds:access',
  'deliveries:read',
  'deliveries:update',
  'reports:read',
  ...Object.values(OnboardingPermissionKeys),
];

export const ALL_PERMISSION_KEYS = [...new Set(CATALOG)];

export const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  [SystemRoleNames.ADMIN]: ['*'],
  [SystemRoleNames.MANAGER]: [
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'categories:read',
    'categories:create',
    'categories:update',
    'orders:read',
    'orders:update',
    'inventory:read',
    'inventory:update',
    'reports:read',
    OnboardingPermissionKeys.ONBOARDING_READ,
    OnboardingPermissionKeys.STAFF_READ,
  ],
  [SystemRoleNames.STAFF]: ['pos:access', 'kds:access', 'orders:read'],
  [SystemRoleNames.DRIVER]: ['deliveries:read', 'deliveries:update'],
  [SystemRoleNames.CUSTOMER]: [],
};

export function resolveRolePermissions(roleName: string, assigned: string[]): string[] {
  if (assigned.length > 0) {
    return assigned;
  }
  return ROLE_PERMISSION_MAP[roleName] ?? [];
}

export function permissionAllowed(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('*')) {
    return true;
  }
  return userPermissions.includes(required);
}
