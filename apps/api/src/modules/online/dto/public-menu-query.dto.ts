import { IsUUID } from 'class-validator';

export class PublicMenuQueryDto {
  @IsUUID()
  locationId!: string;
}
