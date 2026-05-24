import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationChannelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
