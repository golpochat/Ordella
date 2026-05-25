import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard } from '../guards';
import { RequirePermissions } from '../decorators';
import { CreateUserDto, FilterPaginationDto, UpdateUserDto, UserResponseDto } from '../dto';
import { UsersService } from '../services';
import { UserStatus } from '../enums/user-status.enum';

@Controller('staff')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StaffController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @RequirePermissions('staff.read')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<UserResponseDto[]>> {
    const data = await this.usersService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post('create')
  @RequirePermissions('staff.write')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateUserDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const data = await this.usersService.create(tenant, dto);
    return { success: true, data };
  }

  @Post('update')
  @RequirePermissions('staff.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateUserDto & { id: string; isActive?: boolean },
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const { id, isActive, ...patch } = dto;
    const data = await this.usersService.update(tenant, id, {
      ...patch,
      ...(isActive !== undefined
        ? { status: isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE }
        : {}),
    });
    return { success: true, data };
  }

  @Post('disable')
  @RequirePermissions('staff.write')
  async disable(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const data = await this.usersService.disable(tenant, dto.id);
    return { success: true, data };
  }
}
