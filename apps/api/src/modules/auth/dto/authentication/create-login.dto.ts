import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/** API Spec §1.2 POST /api/v1/auth/login */
export class CreateLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
