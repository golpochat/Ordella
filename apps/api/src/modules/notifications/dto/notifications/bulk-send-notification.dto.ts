import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNotificationDto } from './create-notification.dto';

export class BulkSendNotificationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateNotificationDto)
  notifications!: CreateNotificationDto[];
}
