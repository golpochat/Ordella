import { UserStatus } from '../../enums/user-status.enum';

export class UserResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  email!: string;
  phone!: string | null;
  roleId!: string;
  roleName!: string | null;
  permissions!: string[];
  assignedLocations!: string[];
  isActive!: boolean;
  mfaEnabled!: boolean;
  status!: UserStatus;
  externalId!: string | null;
  federatedRoles!: string[];
  lastLoginAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
