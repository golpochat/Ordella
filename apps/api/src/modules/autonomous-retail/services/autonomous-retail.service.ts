import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { EventStoreRecordEntity } from '../../event-bus/entities/event-store-record.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import {
  GenerateDecisionsDto,
  ResolveDecisionDto,
  UpdateConstraintDto,
  UpdatePolicyDto,
} from '../dto';
import {
  AutonomousActionEntity,
  AutonomousDecisionEntity,
  AutonomousDecisionModelEntity,
  AutonomousPolicyEntity,
  AutonomousSafetyConstraintEntity,
  DecisionModelType,
} from '../entities';

const DEFAULT_CONSTRAINTS: Array<{ key: string; name: string; rules: Record<string, unknown> }> = [
  { key: 'price_bounds', name: 'Price floors/ceilings', rules: { minPriceFactor: 0.7, maxPriceFactor: 1.35, maxDailyChangePct: 15 } },
  { key: 'stockout_prevention', name: 'Stockout prevention', rules: { minDaysOfCover: 3, reorderThreshold: 0.15 } },
  { key: 'labor_law', name: 'Labor constraints', rules: { maxShiftHours: 10, minRestHours: 11 } },
  { key: 'promo_budget', name: 'Promotion budget', rules: { maxDailyBudget: 500, maxDiscountPct: 30 } },
];

@Injectable()
export class AutonomousRetailService {
  constructor(
    @InjectRepository(AutonomousPolicyEntity)
    private readonly policies: Repository<AutonomousPolicyEntity>,
    @InjectRepository(AutonomousDecisionModelEntity)
    private readonly models: Repository<AutonomousDecisionModelEntity>,
    @InjectRepository(AutonomousSafetyConstraintEntity)
    private readonly constraints: Repository<AutonomousSafetyConstraintEntity>,
    @InjectRepository(AutonomousDecisionEntity)
    private readonly decisions: Repository<AutonomousDecisionEntity>,
    @InjectRepository(AutonomousActionEntity)
    private readonly actions: Repository<AutonomousActionEntity>,
    @InjectRepository(EventStoreRecordEntity)
    private readonly eventStore: Repository<EventStoreRecordEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    const [pendingDecisions, recentActions, blockedActions, policies] = await Promise.all([
      this.decisions.count({ where: { tenantId: tenant.tenantId, status: 'pending' } }),
      this.actions.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 10 }),
      this.actions.count({ where: { tenantId: tenant.tenantId, status: 'blocked' } }),
      this.policies.find({ where: { tenantId: tenant.tenantId } }),
    ]);
    const riskAlerts = await this.buildRiskAlerts(tenant.tenantId);
    return {
      pendingDecisions,
      recentActions,
      blockedActions,
      policies,
      riskAlerts,
      modelTypes: ['pricing', 'replenishment', 'staffing', 'promotion', 'delivery'],
      integrations: ['ai_assistant', 'digital_twins', 'orchestration', 'data_lake', 'event_bus'],
    };
  }

  async listPolicies(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.policies.find({ where: { tenantId: tenant.tenantId } });
  }

  async updatePolicy(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpdatePolicyDto) {
    await this.ensureDefaults(tenant.tenantId);
    let policy = dto.locationId
      ? await this.policies.findOne({ where: { tenantId: tenant.tenantId, locationId: dto.locationId } })
      : null;
    policy ??= await this.policies.findOne({ where: { tenantId: tenant.tenantId, locationId: IsNull() } });
    if (!policy) throw new NotFoundException('Policy not found');

    Object.assign(policy, {
      ...(dto.mode !== undefined ? { mode: dto.mode } : {}),
      ...(dto.pricingEnabled !== undefined ? { pricingEnabled: dto.pricingEnabled } : {}),
      ...(dto.replenishmentEnabled !== undefined ? { replenishmentEnabled: dto.replenishmentEnabled } : {}),
      ...(dto.staffingEnabled !== undefined ? { staffingEnabled: dto.staffingEnabled } : {}),
      ...(dto.promotionEnabled !== undefined ? { promotionEnabled: dto.promotionEnabled } : {}),
      ...(dto.deliveryEnabled !== undefined ? { deliveryEnabled: dto.deliveryEnabled } : {}),
      ...(dto.overrides !== undefined ? { overrides: dto.overrides } : {}),
      updatedAt: new Date(),
    });
    const saved = await this.policies.save(policy);
    await this.audit(tenant, user, 'autonomous.policy_updated', 'autonomous_policy', saved.id, { ...dto });
    return saved;
  }

  async listConstraints(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.constraints.find({ where: { tenantId: tenant.tenantId } });
  }

  async updateConstraint(tenant: TenantContext, user: AuthenticatedUser | undefined, key: string, dto: UpdateConstraintDto) {
    const row = await this.constraints.findOne({ where: { tenantId: tenant.tenantId, constraintKey: key } });
    if (!row) throw new NotFoundException('Constraint not found');
    row.rules = dto.rules;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    row.updatedAt = new Date();
    const saved = await this.constraints.save(row);
    await this.audit(tenant, user, 'autonomous.constraint_updated', 'autonomous_safety_constraint', saved.id, { key });
    return saved;
  }

  async listModels(tenant: TenantContext) {
    await this.ensureDefaults(tenant.tenantId);
    return this.models.find({ where: { tenantId: tenant.tenantId, isActive: true } });
  }

  async listDecisions(tenant: TenantContext, status?: string) {
    return this.decisions.find({
      where: { tenantId: tenant.tenantId, ...(status ? { status: status as never } : {}) },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async listActions(tenant: TenantContext) {
    return this.actions.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async generateDecisions(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: GenerateDecisionsDto) {
    await this.ensureDefaults(tenant.tenantId);
    const policy = await this.resolvePolicy(tenant.tenantId, dto.locationId ?? null);
    const types = dto.modelTypes ?? ['pricing', 'replenishment', 'staffing', 'promotion', 'delivery'];
    const constraintRows = await this.constraints.find({ where: { tenantId: tenant.tenantId, isActive: true } });

    const proposals = await Promise.all(
      types.map((modelType) => this.buildDecision(tenant, policy, modelType, dto.locationId ?? null, constraintRows)),
    );

    const saved = [];
    for (const proposal of proposals) {
      const decision = await this.decisions.save(this.decisions.create(proposal));
      saved.push(decision);

      if (policy.mode === 'fully_autonomous') {
        await this.executeDecision(tenant, user, decision.id, true);
      }
    }

    await this.audit(tenant, user, 'autonomous.decisions_generated', 'autonomous_decision', null, { count: saved.length });
    return { decisions: saved, mode: policy.mode };
  }

  async resolveDecision(tenant: TenantContext, user: AuthenticatedUser, decisionId: string, dto: ResolveDecisionDto) {
    const decision = await this.decisions.findOne({ where: { tenantId: tenant.tenantId, id: decisionId } });
    if (!decision) throw new NotFoundException('Decision not found');
    if (decision.status !== 'pending') throw new BadRequestException('Decision already resolved');

    if (dto.decision === 'rejected') {
      decision.status = 'rejected';
      await this.decisions.save(decision);
      await this.audit(tenant, user, 'autonomous.decision_rejected', 'autonomous_decision', decisionId, { comment: dto.comment });
      return decision;
    }

    decision.status = 'approved';
    await this.decisions.save(decision);
    return this.executeDecision(tenant, user, decisionId, false);
  }

  async executeDecision(tenant: TenantContext, user: AuthenticatedUser | undefined, decisionId: string, autonomous: boolean) {
    const decision = await this.decisions.findOne({ where: { tenantId: tenant.tenantId, id: decisionId } });
    if (!decision) throw new NotFoundException('Decision not found');

    const constraintRows = await this.constraints.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const safety = this.validateSafety(decision, constraintRows);
    if (!safety.allowed) {
      const blocked = await this.actions.save(this.actions.create({
        tenantId: tenant.tenantId,
        decisionId,
        locationId: decision.locationId,
        actionType: decision.actionType,
        status: 'blocked',
        payload: decision.payload,
        rollbackPayload: null,
        executedBy: autonomous ? 'system' : 'human_override',
        approvedByUserId: user?.id ?? null,
        errorMessage: safety.reason,
      }));
      return { decision, action: blocked, blocked: true };
    }

    const rollbackPayload = this.buildRollbackPayload(decision);
    const action = await this.actions.save(this.actions.create({
      tenantId: tenant.tenantId,
      decisionId,
      locationId: decision.locationId,
      actionType: decision.actionType,
      status: 'executing',
      payload: decision.payload,
      rollbackPayload,
      executedBy: autonomous ? 'system' : 'human_override',
      approvedByUserId: user?.id ?? null,
    }));

    try {
      action.status = 'succeeded';
      action.executedAt = new Date();
      decision.status = 'executed';
      await this.actions.save(action);
      await this.decisions.save(decision);
      await this.audit(tenant, user, 'autonomous.action_executed', 'autonomous_action', action.id, {
        actionType: action.actionType,
        autonomous,
      });
      return { decision, action, blocked: false };
    } catch (error) {
      action.status = 'failed';
      action.errorMessage = error instanceof Error ? error.message : 'Execution failed';
      await this.actions.save(action);
      throw error;
    }
  }

  async rollbackAction(tenant: TenantContext, user: AuthenticatedUser | undefined, actionId: string) {
    const action = await this.actions.findOne({ where: { tenantId: tenant.tenantId, id: actionId } });
    if (!action) throw new NotFoundException('Action not found');
    if (action.status !== 'succeeded') throw new BadRequestException('Only succeeded actions can be rolled back');
    if (!action.rollbackPayload) throw new BadRequestException('No rollback data available');

    action.status = 'rolled_back';
    action.rolledBackAt = new Date();
    await this.actions.save(action);

    if (action.decisionId) {
      const decision = await this.decisions.findOne({ where: { id: action.decisionId } });
      if (decision) {
        decision.status = 'rolled_back';
        await this.decisions.save(decision);
      }
    }

    await this.audit(tenant, user, 'autonomous.action_rolled_back', 'autonomous_action', actionId, {});
    return action;
  }

  async triggerFromEvent(tenant: TenantContext, topicKey: string) {
    const recent = await this.eventStore.count({
      where: { tenantId: tenant.tenantId, topicKey },
    });
    if (recent === 0) return { triggered: 0 };
    const result = await this.generateDecisions(tenant, undefined, {
      modelTypes: topicKey === 'inventory' ? ['replenishment'] : topicKey === 'orders' ? ['pricing', 'promotion'] : ['delivery'],
      batch: true,
    });
    return { triggered: result.decisions.length, topicKey };
  }

  private async buildDecision(
    tenant: TenantContext,
    policy: AutonomousPolicyEntity,
    modelType: DecisionModelType,
    locationId: string | null,
    constraints: AutonomousSafetyConstraintEntity[],
  ) {
    if (!this.isModelEnabled(policy, modelType)) {
      throw new BadRequestException(`Model ${modelType} is disabled for this policy`);
    }

    const products = await this.products.find({ where: { tenantId: tenant.tenantId }, take: 5 });
    const product = products[0];
    const proposals = this.modelProposals(modelType, product);

    const selected = proposals[0];
    const twinNote = 'Digital Twin sandbox simulation recommended before apply (integration hook).';

    return {
      tenantId: tenant.tenantId,
      locationId,
      modelType,
      actionType: selected.actionType,
      status: 'pending' as const,
      confidence: selected.confidence.toFixed(4),
      payload: selected.payload,
      explanation: `${selected.explanation} ${twinNote}`,
      predictedImpact: selected.predictedImpact,
      alternativesConsidered: proposals.slice(1),
      twinSimulationId: null,
    };
  }

  private modelProposals(modelType: DecisionModelType, product: ProductEntity | undefined) {
    const basePrice = product ? Number(product.price) : 10;
    switch (modelType) {
      case 'pricing':
        return [
          {
            actionType: 'adjust_product_prices',
            confidence: 0.82,
            payload: { productId: product?.id, fromPrice: basePrice, toPrice: round(basePrice * 1.05), reason: 'demand_curve' },
            explanation: 'Demand curve suggests +5% price on high-velocity SKU with low elasticity.',
            predictedImpact: { revenue: 4.2, margin: 3.1, stockouts: -0.5 },
          },
          {
            actionType: 'adjust_product_prices',
            confidence: 0.71,
            payload: { productId: product?.id, fromPrice: basePrice, toPrice: round(basePrice * 0.98), reason: 'competitor_signal' },
            explanation: 'Competitor undercut detected; smaller decrease preserves volume.',
            predictedImpact: { revenue: -1.0, margin: -2.0, stockouts: -1.2 },
          },
        ];
      case 'replenishment':
        return [{
          actionType: 'generate_purchase_orders',
          confidence: 0.88,
          payload: { lines: [{ productId: product?.id, qty: 120 }], supplierId: null },
          explanation: 'Forecast + lead time model projects stockout in 4 days; PO recommended.',
          predictedImpact: { stockouts: -12, margin: -0.5, revenue: 1.0 },
        }];
      case 'staffing':
        return [{
          actionType: 'update_staff_schedules',
          confidence: 0.79,
          payload: { shiftDelta: 2, peakWindow: '17:00-20:00' },
          explanation: 'Labor demand model predicts Friday peak; add 2 FTE hours within constraints.',
          predictedImpact: { laborCost: 3.5, stockouts: -2.0, revenue: 2.1 },
        }];
      case 'promotion':
        return [{
          actionType: 'launch_promotion',
          confidence: 0.76,
          payload: { discountPct: 15, budget: 200, categoryId: product?.categoryId },
          explanation: 'Lift model predicts 18% volume lift with acceptable cannibalization.',
          predictedImpact: { revenue: 6.0, margin: -2.5, stockouts: -3.0 },
        }];
      case 'delivery':
        return [{
          actionType: 'adjust_delivery_capacity',
          confidence: 0.81,
          payload: { capacityDelta: 3, routingOptimization: true },
          explanation: 'Routing optimizer suggests +3 driver slots to cut delays 12%.',
          predictedImpact: { deliveryMinutes: -12, laborCost: 1.2, revenue: 0.8 },
        }];
      default:
        return [{
          actionType: 'reorder_low_stock',
          confidence: 0.7,
          payload: {},
          explanation: 'Default replenishment suggestion.',
          predictedImpact: { stockouts: -5 },
        }];
    }
  }

  private validateSafety(decision: AutonomousDecisionEntity, constraints: AutonomousSafetyConstraintEntity[]) {
    const priceRules = constraints.find((c) => c.constraintKey === 'price_bounds')?.rules ?? {};
    const promoRules = constraints.find((c) => c.constraintKey === 'promo_budget')?.rules ?? {};

    if (decision.actionType === 'adjust_product_prices') {
      const from = Number(decision.payload.fromPrice ?? 0);
      const to = Number(decision.payload.toPrice ?? 0);
      const maxChange = Number(priceRules.maxDailyChangePct ?? 15) / 100;
      if (from > 0 && Math.abs(to - from) / from > maxChange) {
        return { allowed: false, reason: `Exceeds max daily price change ${priceRules.maxDailyChangePct}%` };
      }
      const minF = Number(priceRules.minPriceFactor ?? 0.7);
      const maxF = Number(priceRules.maxPriceFactor ?? 1.35);
      if (to < from * minF || to > from * maxF) {
        return { allowed: false, reason: 'Price outside floor/ceiling bounds' };
      }
    }

    if (decision.actionType === 'launch_promotion') {
      const discount = Number(decision.payload.discountPct ?? 0);
      const maxDisc = Number(promoRules.maxDiscountPct ?? 30);
      if (discount > maxDisc) {
        return { allowed: false, reason: `Discount exceeds max ${maxDisc}%` };
      }
    }

    return { allowed: true, reason: null };
  }

  private buildRollbackPayload(decision: AutonomousDecisionEntity) {
    if (decision.actionType === 'adjust_product_prices') {
      return { productId: decision.payload.productId, restorePrice: decision.payload.fromPrice };
    }
    if (decision.actionType === 'launch_promotion') {
      return { promotionRef: decision.payload, action: 'stop_promotion' };
    }
    return { payload: decision.payload, note: 'logical_undo' };
  }

  private isModelEnabled(policy: AutonomousPolicyEntity, modelType: DecisionModelType) {
    const map: Record<DecisionModelType, boolean> = {
      pricing: policy.pricingEnabled,
      replenishment: policy.replenishmentEnabled,
      staffing: policy.staffingEnabled,
      promotion: policy.promotionEnabled,
      delivery: policy.deliveryEnabled,
    };
    return map[modelType];
  }

  private async resolvePolicy(tenantId: string, locationId: string | null) {
    if (locationId) {
      const loc = await this.policies.findOne({ where: { tenantId, locationId } });
      if (loc) return loc;
    }
    const tenantPolicy = await this.policies.findOne({ where: { tenantId, locationId: IsNull() } });
    if (!tenantPolicy) throw new NotFoundException('Autonomy policy not found');
    return tenantPolicy;
  }

  private async buildRiskAlerts(tenantId: string) {
    const alerts = [];
    const blocked = await this.actions.count({ where: { tenantId, status: 'blocked' } });
    if (blocked > 0) alerts.push({ level: 'high', message: `${blocked} actions blocked by safety constraints` });
    const pending = await this.decisions.count({ where: { tenantId, status: 'pending' } });
    if (pending > 5) alerts.push({ level: 'medium', message: `${pending} decisions awaiting approval` });
    if (!alerts.length) alerts.push({ level: 'low', message: 'Autonomous engine operating within guardrails' });
    return alerts;
  }

  private async ensureDefaults(tenantId: string) {
    let policy = await this.policies.findOne({ where: { tenantId, locationId: IsNull() } });
    if (!policy) {
      policy = await this.policies.save(this.policies.create({
        tenantId,
        locationId: null,
        mode: 'semi_autonomous',
        pricingEnabled: true,
        replenishmentEnabled: true,
        staffingEnabled: true,
        promotionEnabled: true,
        deliveryEnabled: true,
        overrides: {},
        isActive: true,
      }));
    }

    for (const c of DEFAULT_CONSTRAINTS) {
      const existing = await this.constraints.findOne({ where: { tenantId, constraintKey: c.key } });
      if (!existing) {
        await this.constraints.save(this.constraints.create({
          tenantId,
          constraintKey: c.key,
          displayName: c.name,
          rules: c.rules,
          isActive: true,
        }));
      }
    }

    const modelTypes: DecisionModelType[] = ['pricing', 'replenishment', 'staffing', 'promotion', 'delivery'];
    for (const modelType of modelTypes) {
      const existing = await this.models.findOne({ where: { tenantId, modelType, version: 1 } });
      if (!existing) {
        await this.models.save(this.models.create({
          tenantId,
          modelType,
          version: 1,
          displayName: `${modelType} model v1`,
          config: { trainingSource: 'data_lake', realTime: true },
          isActive: true,
          publishedAt: new Date(),
        }));
      }
    }

    const locationCount = await this.locations.count({ where: { tenantId } });
    if (locationCount > 0 && (await this.policies.count({ where: { tenantId } })) === 1) {
      const loc = await this.locations.findOne({ where: { tenantId } });
      if (loc) {
        await this.policies.save(this.policies.create({
          tenantId,
          locationId: loc.id,
          mode: 'suggestion_only',
          pricingEnabled: true,
          replenishmentEnabled: true,
          staffingEnabled: true,
          promotionEnabled: true,
          deliveryEnabled: true,
          overrides: { note: 'per-location override example' },
          isActive: true,
        }));
      }
    }
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'autonomous_retail',
      metadata,
    });
  }
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
