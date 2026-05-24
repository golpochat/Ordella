import { IsBoolean, IsEmail, IsString, MaxLength } from 'class-validator';

export class InviteStaffDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(64)
  roleName!: string;
}

export class AssignStaffRoleDto {
  @IsString()
  @MaxLength(64)
  roleName!: string;
}

export class UpdateStaffStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
