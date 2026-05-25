import { IsArray, IsOptional, IsString } from 'class-validator';

export class RotateApiKeyDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
