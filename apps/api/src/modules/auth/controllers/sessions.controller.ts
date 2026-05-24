import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SessionResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { SessionsService } from '../services';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/** API Spec §1.8 Sessions API */
@Controller('sessions')
@UseGuards(TenantGuard, JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<SessionResponseDto[]>> {
    const data = await this.sessionsService.findAll(tenant, user, query);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminate(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.sessionsService.terminate(tenant, user, id);
  }
}
