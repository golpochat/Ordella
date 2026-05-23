import { IsOptional, IsString } from 'class-validator';

/** API Spec §1.4 POST /api/v1/auth/logout */
export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
