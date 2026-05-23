import { IsString, Length } from 'class-validator';

/** API Spec §1.5 POST /api/v1/auth/mfa/verify */
export class MfaVerifyDto {
  @IsString()
  mfaToken!: string;

  @IsString()
  @Length(6, 8)
  code!: string;
}
