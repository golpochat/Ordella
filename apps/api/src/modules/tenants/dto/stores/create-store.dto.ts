import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { StoreStatus } from '../../enums/store-status.enum';

/** SRS §2.3 — create store (tenant-scoped) */
export class CreateStoreDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}
