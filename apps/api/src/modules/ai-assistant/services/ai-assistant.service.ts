import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { UserEntity } from '../../auth/entities';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { DeliveryTaskEntity } from '../../deliveries/entities';
import { DeliveryTaskStatus } from '../../deliveries/enums/delivery-task-status.enum';
import { ForecastSnapshotEntity } from '../../forecast/entities/forecast-snapshot.entity';
import { StockItemEntity } from '../../inventory/entities';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { SupportTicketEntity } from '../../support/entities/support-ticket.entity';
import { SupportTicketStatus } from '../../support/entities/support-ticket.enums';
import { StaffShiftEntity } from '../../staff-scheduling/entities/staff-shift.entity';
import { AccuracyFeedbackDto, ReviewAiActionDto, SendAssistantMessageDto, UpdateAutomationSettingDto } from '../dto';
import {
  AiActionRequestEntity,
  AiAutomationSettingEntity,
  AiConversationEntity,
  AiInsightEntity,
  AiMessageEntity,
  AiUsageMetricEntity,
} from '../entities';

const AUTOMATION_TYPES = ['purchase_orders', 'staffing_templates', 'marketing_campaigns', 'dynamic_pricing', 'notifications', 'support_replies'] as const;
const EXCLUDED_ORDER_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];

@Injectable()
export class AiAssistantService {
  constructor(
    @InjectRepository(AiConversationEntity)
    private readonly conversations: Repository<AiConversationEntity>,
    @InjectRepository(AiMessageEntity)
    private readonly messages: Repository<AiMessageEntity>,
    @InjectRepository(AiActionRequestEntity)
    private readonly actions: Repository<AiActionRequestEntity>,
    @InjectRepository(AiAutomationSettingEntity)
    private readonly settings: Repository<AiAutomationSettingEntity>,
    @InjectRepository(AiInsightEntity)
    private readonly insights: Repository<AiInsightEntity>,
    @InjectRepository(AiUsageMetricEntity)
    private readonly metrics: Repository<AiUsageMetricEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    @InjectRepository(SupportTicketEntity)
    private readonly supportTickets: Repository<SupportTicketEntity>,
    @InjectRepository(StaffShiftEntity)
    private readonly staffShifts: Repository<StaffShiftEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(ForecastSnapshotEntity)
    private readonly forecasts: Repository<ForecastSnapshotEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async listConversations(tenant: TenantContext): Promise<AiConversationEntity[]> {
    return this.conversations.find({ where: { tenantId: tenant.tenantId }, order: { updatedAt: 'DESC' }, take: 20 });
  }

  async conversationMessages(tenant: TenantContext, conversationId: string): Promise<AiMessageEntity[]> {
    await this.requireConversation(tenant.tenantId, conversationId);
    return this.messages.find({ where: { tenantId: tenant.tenantId, conversationId }, order: { createdAt: 'ASC' } });
  }

  async sendMessage(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: SendAssistantMessageDto) {
    const snapshot = await this.operationalSnapshot(tenant.tenantId);
    const conversation = dto.conversationId
      ? await this.requireConversation(tenant.tenantId, dto.conversationId)
      : await this.conversations.save(this.conversations.create({
        tenantId: tenant.tenantId,
        createdByUserId: user?.id ?? null,
        title: this.titleFrom(dto.message),
        context: { startedFrom: 'admin_ai_assistant' },
      }));

    const userMessage = await this.messages.save(this.messages.create({
      tenantId: tenant.tenantId,
      conversationId: conversation.id,
      role: 'user',
      content: dto.message,
      metadata: {},
    }));
    const answer = this.answer(dto.message, snapshot);
    const proposedActions = await this.proposeActions(tenant, user, conversation.id, dto.message, snapshot);
    const assistantMessage = await this.messages.save(this.messages.create({
      tenantId: tenant.tenantId,
      conversationId: conversation.id,
      role: 'assistant',
      content: answer,
      metadata: {
        snapshot,
        proposedActionIds: proposedActions.map((action) => action.id),
        followUps: this.followUps(dto.message),
      },
    }));
    conversation.updatedAt = new Date();
    await this.conversations.save(conversation);
    await this.recordMetric(tenant.tenantId, 'chat_message', { conversationId: conversation.id, messageId: assistantMessage.id });
    await this.audit(tenant, user, 'ai_assistant.message_sent', 'ai_conversation', conversation.id, { prompt: dto.message.slice(0, 120), proposedActions: proposedActions.length });
    return {
      conversation,
      userMessage,
      assistantMessage,
      proposedActions,
      suggestedPrompts: this.suggestedPrompts(),
      followUps: this.followUps(dto.message),
    };
  }

  async generateInsights(tenant: TenantContext, user?: AuthenticatedUser) {
    const snapshot = await this.operationalSnapshot(tenant.tenantId);
    const generated = this.buildInsights(snapshot);
    const saved: AiInsightEntity[] = [];
    for (const insight of generated) {
      saved.push(await this.insights.save(this.insights.create({ tenantId: tenant.tenantId, status: 'open', ...insight })));
    }
    await this.recordMetric(tenant.tenantId, 'insight_generated', { count: saved.length });
    await this.audit(tenant, user, 'ai_assistant.insights_generated', 'ai_insight', null, { count: saved.length });
    return saved;
  }

  async listInsights(tenant: TenantContext) {
    return this.insights.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async listActions(tenant: TenantContext) {
    return this.actions.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async reviewAction(tenant: TenantContext, user: AuthenticatedUser | undefined, id: string, dto: ReviewAiActionDto) {
    const action = await this.actions.findOne({ where: { id, tenantId: tenant.tenantId } });
    if (!action) throw new NotFoundException('AI action not found');
    if (dto.status === 'rejected') {
      action.status = 'rejected';
      action.approvalNote = dto.note ?? null;
      action.approvedByUserId = user?.id ?? null;
      action.approvedAt = new Date();
      await this.actions.save(action);
      await this.audit(tenant, user, 'ai_assistant.action_rejected', 'ai_action_request', action.id, { actionType: action.actionType });
      return action;
    }
    action.status = 'executed';
    action.approvalNote = dto.note ?? null;
    action.approvedByUserId = user?.id ?? null;
    action.approvedAt = new Date();
    action.executedAt = new Date();
    action.payload = { ...action.payload, executionResult: this.simulatedExecution(action) };
    const saved = await this.actions.save(action);
    await this.recordMetric(tenant.tenantId, 'action_approved', { actionType: action.actionType }, this.estimatedSavings(action));
    await this.audit(tenant, user, 'ai_assistant.action_executed', 'ai_action_request', action.id, { actionType: action.actionType, riskLevel: action.riskLevel });
    return saved;
  }

  async automationSettings(tenant: TenantContext) {
    const existing = await this.settings.find({ where: { tenantId: tenant.tenantId }, order: { automationType: 'ASC' } });
    const existingTypes = new Set(existing.map((setting) => setting.automationType));
    for (const automationType of AUTOMATION_TYPES) {
      if (!existingTypes.has(automationType)) {
        existing.push(await this.settings.save(this.settings.create({
          tenantId: tenant.tenantId,
          automationType,
          isEnabled: false,
          requiresApproval: true,
          thresholds: {},
        })));
      }
    }
    return existing;
  }

  async updateAutomationSetting(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpdateAutomationSettingDto) {
    let setting = await this.settings.findOne({ where: { tenantId: tenant.tenantId, automationType: dto.automationType } });
    setting ??= this.settings.create({ tenantId: tenant.tenantId, automationType: dto.automationType });
    setting.isEnabled = dto.isEnabled;
    setting.requiresApproval = dto.requiresApproval;
    setting.thresholds = dto.thresholds ?? {};
    setting.updatedAt = new Date();
    const saved = await this.settings.save(setting);
    await this.audit(tenant, user, 'ai_assistant.automation_setting_updated', 'ai_automation_setting', saved.id, { automationType: saved.automationType, isEnabled: saved.isEnabled });
    return saved;
  }

  async analytics(tenant: TenantContext) {
    const [metrics, actions, insights] = await Promise.all([
      this.metrics.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 200 }),
      this.actions.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 100 }),
      this.insights.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 100 }),
    ]);
    return {
      usageCount: metrics.reduce((sum, metric) => sum + metric.count, 0),
      actionApprovalRate: actions.length ? actions.filter((action) => ['approved', 'executed'].includes(action.status)).length / actions.length : 0,
      automationImpact: {
        actionsProposed: actions.length,
        actionsExecuted: actions.filter((action) => action.status === 'executed').length,
        openInsights: insights.filter((insight) => insight.status === 'open').length,
      },
      accuracy: this.averageAccuracy(metrics),
      costSavingsCents: metrics.reduce((sum, metric) => sum + metric.estimatedSavingsCents, 0),
      metrics,
    };
  }

  async recordAccuracy(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: AccuracyFeedbackDto) {
    await this.messages.findOneOrFail({ where: { id: dto.messageId, tenantId: tenant.tenantId } });
    const metric = await this.metrics.save(this.metrics.create({
      tenantId: tenant.tenantId,
      metricType: 'accuracy_feedback',
      count: 1,
      estimatedSavingsCents: 0,
      accuracyScore: dto.score,
      metadata: { messageId: dto.messageId, note: dto.note ?? null },
    }));
    await this.audit(tenant, user, 'ai_assistant.accuracy_feedback_recorded', 'ai_usage_metric', metric.id, { messageId: dto.messageId, score: dto.score });
    return metric;
  }

  private async operationalSnapshot(tenantId: string) {
    const today = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [
      currentSales,
      previousSales,
      lowStock,
      stockouts,
      slowMoving,
      customerCount,
      churnRiskCustomers,
      openSupport,
      lateDeliveries,
      activeStaff,
      shiftsNext7Days,
      latestForecasts,
    ] = await Promise.all([
      this.salesBetween(tenantId, weekAgo, today),
      this.salesBetween(tenantId, previousWeekStart, weekAgo),
      this.stockItems.count({ where: { tenantId } }).then(async () => this.lowStockItems(tenantId)),
      this.stockItems.find({ where: { tenantId, quantityOnHand: '0.0000' }, take: 10 }),
      this.slowMovingItems(tenantId),
      this.customers.count({ where: { tenantId } }),
      this.customers.count({ where: { tenantId, lastOrderAt: LessThan(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) } }),
      this.supportTickets.count({ where: { tenantId, status: In([SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS, SupportTicketStatus.WAITING_CUSTOMER]) } }),
      this.deliveries.count({ where: { tenantId, status: In([DeliveryTaskStatus.PENDING, DeliveryTaskStatus.ASSIGNED, DeliveryTaskStatus.EN_ROUTE]) } }),
      this.users.count({ where: { tenantId, status: UserStatus.ACTIVE } }),
      this.staffShifts.count({ where: { tenantId, shiftStart: Between(today, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) } }),
      this.forecasts.find({ where: { tenantId }, order: { generatedAt: 'DESC' }, take: 5 }),
    ]);
    const salesDropPercent = previousSales.revenue > 0 ? ((previousSales.revenue - currentSales.revenue) / previousSales.revenue) * 100 : 0;
    return {
      sales: { current7d: currentSales, previous7d: previousSales, salesDropPercent },
      inventory: {
        lowStockCount: lowStock.length,
        lowStockItems: lowStock.slice(0, 8),
        stockoutCount: stockouts.length,
        slowMovingCount: slowMoving.length,
        slowMovingItems: slowMoving.slice(0, 8),
      },
      customers: { customerCount, churnRiskCustomers },
      support: { openSupport },
      delivery: { activeOrDelayed: lateDeliveries },
      staff: { activeStaff, shiftsNext7Days },
      forecasting: latestForecasts.map((forecast) => ({
        type: forecast.forecastType,
        locationId: forecast.locationId,
        confidence: forecast.confidence,
        generatedAt: forecast.generatedAt,
        summary: forecast.payload.summary ?? forecast.payload.recommendation ?? forecast.payload,
      })),
    };
  }

  private async salesBetween(tenantId: string, from: Date, to: Date) {
    const row = await this.orders
      .createQueryBuilder('order')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.created_at BETWEEN :from AND :to', { from, to })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .getRawOne<{ orders: string; revenue: string }>();
    return { orders: Number(row?.orders ?? 0), revenue: Number(row?.revenue ?? 0) };
  }

  private async lowStockItems(tenantId: string) {
    const items = await this.stockItems.find({ where: { tenantId }, take: 200, order: { updatedAt: 'DESC' } as never });
    return items
      .filter((item) => item.reorderLevel !== null && Number(item.quantityOnHand) <= Number(item.reorderLevel))
      .map((item) => ({ id: item.id, sku: item.sku, name: item.name, locationId: item.locationId, quantityOnHand: Number(item.quantityOnHand), reorderLevel: Number(item.reorderLevel ?? 0) }));
  }

  private async slowMovingItems(tenantId: string) {
    const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    const items = await this.stockItems.find({ where: { tenantId }, take: 200 });
    return items
      .filter((item) => Number(item.quantityOnHand) > 0 && (!item.lastReceivedAt || item.lastReceivedAt < cutoff))
      .map((item) => ({ id: item.id, sku: item.sku, name: item.name, locationId: item.locationId, quantityOnHand: Number(item.quantityOnHand), lastReceivedAt: item.lastReceivedAt }));
  }

  private answer(prompt: string, snapshot: Awaited<ReturnType<AiAssistantService['operationalSnapshot']>>): string {
    const lower = prompt.toLowerCase();
    const parts: string[] = [];
    if (lower.includes('sales') || lower.includes('dashboard') || lower.includes('report')) {
      parts.push(`Sales in the last 7 days are ${this.money(snapshot.sales.current7d.revenue)} across ${snapshot.sales.current7d.orders} orders. The week-over-week sales change is ${snapshot.sales.salesDropPercent.toFixed(1)}%.`);
    }
    if (lower.includes('inventory') || lower.includes('stock') || lower.includes('reorder')) {
      parts.push(`Inventory has ${snapshot.inventory.lowStockCount} low-stock items and ${snapshot.inventory.stockoutCount} stockouts. Top reorder candidates: ${snapshot.inventory.lowStockItems.map((item) => item.name).join(', ') || 'none'}.`);
    }
    if (lower.includes('customer') || lower.includes('churn') || lower.includes('loyalty')) {
      parts.push(`${snapshot.customers.churnRiskCustomers} of ${snapshot.customers.customerCount} customers are churn-risk based on no orders in 60 days. Consider a win-back reward or segmented journey.`);
    }
    if (lower.includes('delivery')) {
      parts.push(`Delivery has ${snapshot.delivery.activeOrDelayed} active or potentially delayed tasks. Review driver assignment and prep handoff times.`);
    }
    if (lower.includes('staff') || lower.includes('labor')) {
      parts.push(`There are ${snapshot.staff.shiftsNext7Days} scheduled shifts over the next 7 days for ${snapshot.staff.activeStaff} active staff. Compare this with demand forecast before the weekend rush.`);
    }
    if (lower.includes('forecast')) {
      parts.push(`Latest forecasts available: ${snapshot.forecasting.map((forecast) => `${forecast.type} (${forecast.confidence ?? 'n/a'} confidence)`).join(', ') || 'none yet'}.`);
    }
    if (!parts.length) {
      parts.push(`I reviewed sales, inventory, customers, delivery, staffing, support, and forecasting. Key risks: ${snapshot.inventory.lowStockCount} low-stock items, ${snapshot.customers.churnRiskCustomers} churn-risk customers, and ${snapshot.delivery.activeOrDelayed} active delivery tasks.`);
    }
    parts.push('Recommended next step: review the proposed actions and approve only the ones you want Ordella to execute.');
    return parts.join('\n\n');
  }

  private buildInsights(snapshot: Awaited<ReturnType<AiAssistantService['operationalSnapshot']>>) {
    const insights: Array<Partial<AiInsightEntity>> = [];
    if (snapshot.inventory.lowStockCount > 0) {
      insights.push({
        category: 'inventory',
        severity: snapshot.inventory.lowStockCount > 10 ? 'high' : 'medium',
        title: 'Low-stock products need reorder review',
        summary: `${snapshot.inventory.lowStockCount} items are at or below reorder level.`,
        recommendedAction: 'Generate purchase order suggestions for approval.',
        metadata: { items: snapshot.inventory.lowStockItems },
        status: 'open',
      });
    }
    if (snapshot.inventory.slowMovingCount > 0) {
      insights.push({
        category: 'inventory',
        severity: 'medium',
        title: 'Slow-moving inventory detected',
        summary: `${snapshot.inventory.slowMovingCount} items have inventory on hand but no recent receiving activity.`,
        recommendedAction: 'Launch a targeted promotion or bundle slow movers.',
        metadata: { items: snapshot.inventory.slowMovingItems },
        status: 'open',
      });
    }
    if (snapshot.sales.salesDropPercent > 15) {
      insights.push({
        category: 'sales',
        severity: 'high',
        title: 'Sales drop anomaly detected',
        summary: `Sales are down ${snapshot.sales.salesDropPercent.toFixed(1)}% compared with the prior 7 days.`,
        recommendedAction: 'Review channel mix and consider a short promotion.',
        metadata: { sales: snapshot.sales },
        status: 'open',
      });
    }
    if (snapshot.customers.churnRiskCustomers > 0) {
      insights.push({
        category: 'customers',
        severity: 'medium',
        title: 'High-churn customer segment available',
        summary: `${snapshot.customers.churnRiskCustomers} customers have not ordered in over 60 days.`,
        recommendedAction: 'Create a win-back journey with loyalty reward.',
        metadata: { customers: snapshot.customers },
        status: 'open',
      });
    }
    if (snapshot.delivery.activeOrDelayed > 5) {
      insights.push({
        category: 'delivery',
        severity: 'medium',
        title: 'Delivery bottleneck risk',
        summary: `${snapshot.delivery.activeOrDelayed} deliveries are active or waiting.`,
        recommendedAction: 'Adjust driver assignment and prep handoff.',
        metadata: { delivery: snapshot.delivery },
        status: 'open',
      });
    }
    return insights;
  }

  private async proposeActions(tenant: TenantContext, user: AuthenticatedUser | undefined, conversationId: string, prompt: string, snapshot: Awaited<ReturnType<AiAssistantService['operationalSnapshot']>>) {
    const lower = prompt.toLowerCase();
    const actions: AiActionRequestEntity[] = [];
    const add = async (actionType: AiActionRequestEntity['actionType'], riskLevel: AiActionRequestEntity['riskLevel'], payload: Record<string, unknown>) => {
      const action = await this.actions.save(this.actions.create({
        tenantId: tenant.tenantId,
        conversationId,
        createdByUserId: user?.id ?? null,
        actionType,
        status: 'pending_approval',
        riskLevel,
        payload,
        approvalNote: null,
        approvedByUserId: null,
        approvedAt: null,
        executedAt: null,
      }));
      await this.recordMetric(tenant.tenantId, 'action_proposed', { actionType });
      actions.push(action);
    };
    if (snapshot.inventory.lowStockCount > 0 && (lower.includes('reorder') || lower.includes('recommend') || lower.includes('inventory') || lower.includes('automate'))) {
      await add('generate_purchase_order', 'high', { items: snapshot.inventory.lowStockItems, approvalRequired: true });
    }
    if (snapshot.staff.shiftsNext7Days < Math.max(1, Math.ceil(snapshot.sales.current7d.orders / 50)) && (lower.includes('staff') || lower.includes('labor') || lower.includes('recommend'))) {
      await add('adjust_staffing_template', 'high', { reason: 'Demand-to-shift ratio suggests extra coverage.', forecast: snapshot.forecasting });
    }
    if ((snapshot.inventory.slowMovingCount > 0 || snapshot.sales.salesDropPercent > 15) && (lower.includes('promotion') || lower.includes('marketing') || lower.includes('recommend'))) {
      await add('create_marketing_campaign', 'medium', { segment: 'slow_movers_or_sales_drop', items: snapshot.inventory.slowMovingItems });
      await add('apply_dynamic_pricing', 'critical', { rule: 'temporary_discount_for_slow_movers', items: snapshot.inventory.slowMovingItems });
    }
    if (snapshot.customers.churnRiskCustomers > 0 && (lower.includes('customer') || lower.includes('loyalty') || lower.includes('reward') || lower.includes('journey'))) {
      await add('suggest_loyalty_reward', 'medium', { segment: 'churn_risk_60_days', customerCount: snapshot.customers.churnRiskCustomers });
    }
    if (snapshot.support.openSupport > 0 && (lower.includes('support') || lower.includes('reply'))) {
      await add('suggest_support_reply', 'low', { openTickets: snapshot.support.openSupport, tone: 'empathetic' });
    }
    return actions;
  }

  private simulatedExecution(action: AiActionRequestEntity) {
    const labels: Record<string, string> = {
      generate_purchase_order: 'Draft purchase order suggestion created for replenishment approval.',
      adjust_staffing_template: 'Draft staffing template adjustment queued.',
      create_marketing_campaign: 'Draft marketing campaign created.',
      apply_dynamic_pricing: 'Dynamic pricing rule prepared for promotions approval.',
      trigger_notification: 'Notification trigger queued.',
      suggest_support_reply: 'Support reply suggestion generated.',
      suggest_loyalty_reward: 'Loyalty reward suggestion generated.',
    };
    return { executed: true, message: labels[action.actionType] ?? 'Action executed', humanInLoop: true };
  }

  private async requireConversation(tenantId: string, id: string) {
    const conversation = await this.conversations.findOne({ where: { id, tenantId } });
    if (!conversation) throw new NotFoundException('AI conversation not found');
    return conversation;
  }

  private async recordMetric(tenantId: string, metricType: AiUsageMetricEntity['metricType'], metadata: Record<string, unknown>, estimatedSavingsCents = 0) {
    await this.metrics.save(this.metrics.create({ tenantId, metricType, count: 1, estimatedSavingsCents, accuracyScore: null, metadata }));
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'admin_ui',
      riskLevel: action.includes('executed') ? 'high' : 'medium',
      metadata,
    });
  }

  private followUps(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    if (lower.includes('inventory')) return ['Which SKUs should I reorder first?', 'Create draft purchase order actions?', 'Which locations are most exposed?'];
    if (lower.includes('delivery')) return ['Which orders are delayed?', 'Do we need more drivers today?', 'Show bottlenecks by location.'];
    return ['What should I do next?', 'Show anomalies by location.', 'Generate approval-ready actions.'];
  }

  private suggestedPrompts(): string[] {
    return [
      'Summarize today’s retail operations risks.',
      'Which inventory items should we reorder?',
      'Explain the latest demand and labor forecasts.',
      'Find sales drops and suggest promotions.',
      'Identify delivery bottlenecks.',
      'Draft actions for approval.',
    ];
  }

  private estimatedSavings(action: AiActionRequestEntity): number {
    if (action.actionType === 'generate_purchase_order') return 1500;
    if (action.actionType === 'adjust_staffing_template') return 2500;
    if (action.actionType === 'create_marketing_campaign') return 1000;
    return 500;
  }

  private averageAccuracy(metrics: AiUsageMetricEntity[]): number | null {
    const scores = metrics.map((metric) => metric.accuracyScore).filter((score): score is string => Boolean(score)).map(Number);
    return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  }

  private titleFrom(message: string): string {
    return message.trim().slice(0, 80) || 'Retail operations assistant';
  }

  private money(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
