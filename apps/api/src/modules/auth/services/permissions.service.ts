import { Injectable, NotImplementedException } from '@nestjs/common';
import { PermissionResponseDto } from '../dto/permissions/permission-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

@Injectable()
export class PermissionsService {
  findAll(_query: PaginationQueryDto): Promise<PermissionResponseDto[]> {
    throw new NotImplementedException('findAll permissions');
  }
}
