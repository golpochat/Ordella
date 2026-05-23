import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

/** API Spec §13.5 POST /api/v1/api-keys */
export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
