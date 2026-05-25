import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
