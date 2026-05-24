import { Injectable, NotImplementedException } from '@nestjs/common';
import { PermissionResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';

@Injectable()
export class PermissionsService {
  findAll(_query: FilterPaginationDto): Promise<PermissionResponseDto[]> {
    throw new NotImplementedException('findAll permissions');
  }
}
