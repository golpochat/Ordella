import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { PermissionResponseDto } from '../dto/permissions/permission-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PermissionsService } from '../services/permissions.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<PermissionResponseDto[]>> {
    const data = await this.permissionsService.findAll(query);
    return { success: true, data };
  }
}
