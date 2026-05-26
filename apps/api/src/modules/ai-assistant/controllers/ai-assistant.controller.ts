import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AccuracyFeedbackDto, ReviewAiActionDto, SendAssistantMessageDto, UpdateAutomationSettingDto } from '../dto';
import { AiAssistantService } from '../services/ai-assistant.service';

@Controller('ai-assistant')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AiAssistantController {
  constructor(private readonly assistant: AiAssistantService) {}

  @Get('conversations')
  @RequirePermissions('ai-assistant.read')
  async conversations(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.listConversations(tenant);
    return { success: true, data };
  }

  @Get('conversations/:id/messages')
  @RequirePermissions('ai-assistant.read')
  async messages(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.conversationMessages(tenant, id);
    return { success: true, data };
  }

  @Post('chat')
  @RequirePermissions('ai-assistant.read')
  async chat(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: SendAssistantMessageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.sendMessage(tenant, user, dto);
    return { success: true, data };
  }

  @Get('insights')
  @RequirePermissions('ai-assistant.insights')
  async insights(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.listInsights(tenant);
    return { success: true, data };
  }

  @Post('insights/generate')
  @RequirePermissions('ai-assistant.insights')
  async generateInsights(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.generateInsights(tenant, user);
    return { success: true, data };
  }

  @Get('actions')
  @RequirePermissions('ai-assistant.actions')
  async actions(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.listActions(tenant);
    return { success: true, data };
  }

  @Post('actions/:id/review')
  @RequirePermissions('ai-assistant.approve')
  async reviewAction(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewAiActionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.reviewAction(tenant, user, id, dto);
    return { success: true, data };
  }

  @Get('automation-settings')
  @RequirePermissions('ai-assistant.controls')
  async automationSettings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.automationSettings(tenant);
    return { success: true, data };
  }

  @Post('automation-settings')
  @RequirePermissions('ai-assistant.controls')
  async updateAutomationSetting(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateAutomationSettingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.updateAutomationSetting(tenant, user, dto);
    return { success: true, data };
  }

  @Get('analytics')
  @RequirePermissions('ai-assistant.analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.analytics(tenant);
    return { success: true, data };
  }

  @Post('accuracy-feedback')
  @RequirePermissions('ai-assistant.analytics')
  async accuracyFeedback(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: AccuracyFeedbackDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.assistant.recordAccuracy(tenant, user, dto);
    return { success: true, data };
  }
}
