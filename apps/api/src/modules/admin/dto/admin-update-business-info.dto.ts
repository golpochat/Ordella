import { IsOptional, IsString } from 'class-validator';

export class AdminUpdateBusinessInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;
}
