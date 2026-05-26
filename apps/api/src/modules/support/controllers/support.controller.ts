import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CurrentCustomer } from '../../customer-accounts/decorators/current-customer.decorator';
import { CustomerAuthGuard } from '../../customer-accounts/guards/customer-auth.guard';
import { CustomerAuthPayload } from '../../customer-accounts/types/customer-auth-payload';
import {
  AddSupportMessageDto,
  AssignSupportTicketDto,
  CreateSupportChatTicketDto,
  CreateSupportTicketDto,
  RateSupportTicketDto,
  UpdateSupportTicketDto,
} from '../dto';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus,
} from '../entities';
import { SupportService } from '../services/support.service';

@Controller('support')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AdminSupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  @RequirePermissions('support.read')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query('status') status?: SupportTicketStatus,
    @Query('category') category?: SupportTicketCategory,
    @Query('priority') priority?: SupportTicketPriority,
    @Query('assignedTo') assignedTo?: string,
    @Query('customerId') customerId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.support.list(tenant, { status, category, priority, assignedTo, customerId });
    return { success: true, data };
  }

  @Get('tickets/analytics')
  @RequirePermissions('support.analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.analytics(tenant);
    return { success: true, data };
  }

  @Get('tickets/canned-responses')
  @RequirePermissions('support.read')
  async cannedResponses(): Promise<ApiSuccessResponse<unknown[]>> {
    return { success: true, data: this.support.cannedResponses() };
  }

  @Get('tickets/:id')
  @RequirePermissions('support.read')
  async get(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.get(tenant, id);
    return { success: true, data };
  }

  @Post('tickets')
  @RequirePermissions('support.write')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.create(tenant, dto, { actorUserId: user.id, source: SupportTicketSource.ADMIN });
    return { success: true, data };
  }

  @Patch('tickets/:id')
  @RequirePermissions('support.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.update(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('tickets/:id/assign')
  @RequirePermissions('support.assign')
  async assign(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.assign(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('tickets/:id/messages')
  @RequirePermissions('support.write')
  async addMessage(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddSupportMessageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.addMessage(tenant, id, dto, { user });
    return { success: true, data };
  }
}

@Controller('public/customer/support')
@UseGuards(TenantGuard, CustomerAuthGuard)
export class CustomerSupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.support.listForCustomer(tenant, customer.sub);
    return { success: true, data };
  }

  @Get('tickets/:id')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.get(tenant, id, customer.sub);
    return { success: true, data };
  }

  @Post('tickets')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Body() dto: CreateSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.create(tenant, dto, { customerId: customer.sub, source: SupportTicketSource.CUSTOMER_PORTAL });
    return { success: true, data };
  }

  @Post('tickets/:id/messages')
  async addMessage(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
    @Body() dto: AddSupportMessageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.addMessage(tenant, id, dto, { customerId: customer.sub });
    return { success: true, data };
  }

  @Post('tickets/:id/rating')
  async rate(
    @CurrentTenant() tenant: TenantContext,
    @CurrentCustomer() customer: CustomerAuthPayload,
    @Param('id') id: string,
    @Body() dto: RateSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.rate(tenant, id, customer.sub, dto);
    return { success: true, data };
  }
}

@Controller('public/support')
@UseGuards(TenantGuard)
export class PublicSupportController {
  constructor(private readonly support: SupportService) {}

  @Post('tickets')
  async createChatTicket(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateSupportChatTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.support.createFromChat(tenant, dto);
    return { success: true, data };
  }
}
