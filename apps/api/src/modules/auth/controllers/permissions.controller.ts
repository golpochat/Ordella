import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { PermissionResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { PermissionsService } from '../services';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions:read')
  async findAll(
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<PermissionResponseDto[]>> {
    const data = await this.permissionsService.findAll(query);
    return { success: true, data };
  }
}
