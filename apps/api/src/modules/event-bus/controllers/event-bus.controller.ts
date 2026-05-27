import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { PublishEventDto, PublishEventsDto, ReplayEventsDto, SubscribeTopicDto, UpdateTopicPermissionsDto } from '../dto';
import { EventBusService } from '../services';

@Controller('event-bus')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class EventBusController {
  constructor(private readonly eventBus: EventBusService) {}

  @Get('dashboard')
  @RequirePermissions('event-bus.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.dashboard(tenant) };
  }

  @Get('topics')
  @RequirePermissions('event-bus.read')
  async topics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.listTopics(tenant) };
  }

  @Post('topics/:id/permissions')
  @RequirePermissions('event-bus.admin')
  async updatePermissions(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateTopicPermissionsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.updateTopicPermissions(tenant, user, id, dto.permissions) };
  }

  @Get('streams/:topicKey')
  @RequirePermissions('event-bus.read')
  async stream(
    @CurrentTenant() tenant: TenantContext,
    @Param('topicKey') topicKey: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.stream(tenant, topicKey, cursor, limit ? Number(limit) : 100) };
  }

  @Get('events/:eventId')
  @RequirePermissions('event-bus.read')
  async event(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.getEvent(tenant, eventId) };
  }

  @Post('publish')
  @RequirePermissions('event-bus.publish')
  async publish(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: PublishEventDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.publish(tenant, user, dto) };
  }

  @Post('publish-batch')
  @RequirePermissions('event-bus.publish')
  async publishBatch(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: PublishEventsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.publishBatch(tenant, user, dto) };
  }

  @Post('subscribe')
  @RequirePermissions('event-bus.subscribe')
  async subscribe(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: SubscribeTopicDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.subscribe(tenant, user, dto) };
  }

  @Post('replay')
  @RequirePermissions('event-bus.replay')
  async replay(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: ReplayEventsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.replay(tenant, user, dto) };
  }

  @Get('dead-letters')
  @RequirePermissions('event-bus.read')
  async deadLetters(
    @CurrentTenant() tenant: TenantContext,
    @Query('topicKey') topicKey?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.eventBus.listDeadLetters(tenant, topicKey) };
  }
}
