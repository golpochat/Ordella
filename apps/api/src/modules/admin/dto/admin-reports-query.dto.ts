import { IsDateString, IsOptional } from 'class-validator';

export class AdminReportsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
