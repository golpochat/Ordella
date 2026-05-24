import { IsOptional, IsString, Length, MinLength } from 'class-validator';

/** SRS §1.2 — PIN login for POS */
export class CreatePinLoginDto {
  @IsString()
  @Length(4, 8)
  pin!: string;

  @IsString()
  @MinLength(1)
  terminalId!: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
