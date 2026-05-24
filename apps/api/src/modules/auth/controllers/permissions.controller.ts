import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { JwtAuthGuard } from '../guards';
import { RbacGuard } from '../guards';
import { RequirePermissions } from '../decorators';
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
