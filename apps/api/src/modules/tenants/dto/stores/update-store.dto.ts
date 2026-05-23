import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { StoreStatus } from '../../enums/store-status.enum';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}
