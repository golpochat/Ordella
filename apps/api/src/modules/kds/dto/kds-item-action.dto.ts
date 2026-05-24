import { IsOptional, IsString, MaxLength } from 'class-validator';

export class KdsItemActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  station?: string;
}
