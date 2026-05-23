import { UserStatus } from '../../enums/user-status.enum';

export class UserResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  email!: string;
  roleId!: string;
  mfaEnabled!: boolean;
  status!: UserStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
