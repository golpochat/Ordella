import { Injectable, NotImplementedException } from '@nestjs/common';
import { PermissionResponseDto } from '../dto/permissions/permission-response.dto';
import { FilterPaginationDto } from '../dto/filter-pagination.dto';

@Injectable()
export class PermissionsService {
  findAll(_query: FilterPaginationDto): Promise<PermissionResponseDto[]> {
    throw new NotImplementedException('findAll permissions');
  }
}
