import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

/** PUT /locations/:id/staff */
export class AssignLocationStaffDto {
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', { each: true })
  userIds!: string[];
}
