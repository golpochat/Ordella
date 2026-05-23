import { IsString } from 'class-validator';

/** API Spec §1.3 POST /api/v1/auth/refresh */
export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
