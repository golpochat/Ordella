import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateRoleDto } from '../dto';
import { UpdateRolePermissionsDto } from '../dto';
import { RoleResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';

@Injectable()
export class RolesService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<RoleResponseDto[]> {
    throw new NotImplementedException('findAll roles');
  }

  create(_tenant: TenantContext, _dto: CreateRoleDto): Promise<RoleResponseDto> {
    throw new NotImplementedException('create role');
  }

  assignPermissions(
    _tenant: TenantContext,
    _roleId: string,
    _dto: UpdateRolePermissionsDto,
  ): Promise<void> {
    throw new NotImplementedException('assignPermissions');
  }
}
