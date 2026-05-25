import { IsBoolean, IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketingEmail?: boolean;
    marketingSms?: boolean;
  };

  @IsOptional()
  @IsBoolean()
  marketingEmailOptIn?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingSmsOptIn?: boolean;
}
