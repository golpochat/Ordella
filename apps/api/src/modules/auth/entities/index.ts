import { ApiKeyEntity } from './api-key.entity';
import { MfaFactorEntity } from './mfa-factor.entity';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';
import { RolePermissionEntity } from './role-permission.entity';
import { SessionEntity } from './session.entity';
import { UserDeviceEntity } from './user-device.entity';
import { UserEntity } from './user.entity';

export { ApiKeyEntity } from './api-key.entity';
export { BaseTenantEntity } from './base-tenant.entity';
export { MfaFactorEntity } from './mfa-factor.entity';
export { PermissionEntity } from './permission.entity';
export { RoleEntity } from './role.entity';
export { RolePermissionEntity } from './role-permission.entity';
export { SessionEntity } from './session.entity';
export { UserDeviceEntity } from './user-device.entity';
export { UserEntity } from './user.entity';

export const AUTH_ENTITIES = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  SessionEntity,
  ApiKeyEntity,
  UserDeviceEntity,
  MfaFactorEntity,
];
