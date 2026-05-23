import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateRoleDto } from '../dto/roles/create-role.dto';
import { AssignPermissionsDto } from '../dto/roles/assign-permissions.dto';
import { RoleResponseDto } from '../dto/roles/role-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class RolesService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<RoleResponseDto[]> {
    throw new NotImplementedException('findAll roles');
  }

  create(_tenant: TenantContext, _dto: CreateRoleDto): Promise<RoleResponseDto> {
    throw new NotImplementedException('create role');
  }

  assignPermissions(
    _tenant: TenantContext,
    _roleId: string,
    _dto: AssignPermissionsDto,
  ): Promise<void> {
    throw new NotImplementedException('assignPermissions');
  }
}
