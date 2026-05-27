import { createHash } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { EventStoreRecordEntity } from '../../event-bus/entities/event-store-record.entity';
import { NotificationsService } from '../../notifications/services';
import {
  CreateWorkflowDto,
  ResolveApprovalDto,
  RetryStepRunDto,
  SaveWorkflowCanvasDto,
  StartWorkflowRunDto,
  TriggerEventDto,
  UpdateWorkflowDto,
  UpsertWorkflowStepDto,
  UpsertWorkflowTriggerDto,
} from '../dto';
import {
  WorkflowApprovalEntity,
  WorkflowDeadLetterEntity,
  WorkflowEntity,
  WorkflowRunEntity,
  WorkflowStepEntity,
  WorkflowStepRunEntity,
  WorkflowStepType,
  WorkflowTriggerEntity,
  WorkflowVersionEntity,
} from '../entities';

const STEP_TYPES: WorkflowStepType[] = [
  'data_fetch',
  'condition',
  'delay',
  'approval',
  'notification',
  'entity_mutation',
  'integration',
  'ai_action',
  'custom_code',
];

@Injectable()
export class OrchestrationService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflows: Repository<WorkflowEntity>,
    @InjectRepository(WorkflowVersionEntity)
    private readonly versions: Repository<WorkflowVersionEntity>,
    @InjectRepository(WorkflowStepEntity)
    private readonly steps: Repository<WorkflowStepEntity>,
    @InjectRepository(WorkflowTriggerEntity)
    private readonly triggers: Repository<WorkflowTriggerEntity>,
    @InjectRepository(WorkflowRunEntity)
    private readonly runs: Repository<WorkflowRunEntity>,
    @InjectRepository(WorkflowStepRunEntity)
    private readonly stepRuns: Repository<WorkflowStepRunEntity>,
    @InjectRepository(WorkflowApprovalEntity)
    private readonly approvals: Repository<WorkflowApprovalEntity>,
    @InjectRepository(WorkflowDeadLetterEntity)
    private readonly deadLetters: Repository<WorkflowDeadLetterEntity>,
    @InjectRepository(EventStoreRecordEntity)
    private readonly eventStore: Repository<EventStoreRecordEntity>,
    private readonly auditLogs: AuditLogService,
    private readonly notifications: NotificationsService,
  ) {}

  async dashboard(tenant: TenantContext) {
    await this.ensureSampleWorkflows(tenant.tenantId);
    const [workflowCount, activeRuns, failedRuns, pendingApprovals, openDlq] = await Promise.all([
      this.workflows.count({ where: { tenantId: tenant.tenantId } }),
      this.runs.count({ where: { tenantId: tenant.tenantId, status: 'running' } }),
      this.runs.count({ where: { tenantId: tenant.tenantId, status: 'failed' } }),
      this.approvals.count({ where: { tenantId: tenant.tenantId, status: 'pending' } }),
      this.deadLetters.count({ where: { tenantId: tenant.tenantId, status: 'open' } }),
    ]);
    const recentRuns = await this.runs.find({
      where: { tenantId: tenant.tenantId },
      order: { startedAt: 'DESC' },
      take: 10,
    });
    return {
      workflowCount,
      activeRuns,
      failedRuns,
      pendingApprovals,
      openDeadLetters: openDlq,
      recentRuns,
      stepTypes: STEP_TYPES,
      integrations: ['event_bus', 'data_lake', 'ai_assistant', 'marketing', 'inventory', 'staff_scheduling'],
    };
  }

  async listWorkflows(tenant: TenantContext) {
    await this.ensureSampleWorkflows(tenant.tenantId);
    return this.workflows.find({ where: { tenantId: tenant.tenantId }, order: { updatedAt: 'DESC' } });
  }

  async getWorkflow(tenant: TenantContext, workflowId: string) {
    const workflow = await this.workflows.findOne({ where: { tenantId: tenant.tenantId, id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    const version = await this.versions.findOne({
      where: { tenantId: tenant.tenantId, workflowId, version: workflow.currentVersion },
    });
    const [stepRows, triggerRows, versionHistory] = await Promise.all([
      version ? this.steps.find({ where: { tenantId: tenant.tenantId, workflowVersionId: version.id }, order: { stepOrder: 'ASC' } }) : [],
      this.triggers.find({ where: { tenantId: tenant.tenantId, workflowId } }),
      this.versions.find({ where: { tenantId: tenant.tenantId, workflowId }, order: { version: 'DESC' } }),
    ]);
    return { workflow, version, steps: stepRows, triggers: triggerRows, versionHistory };
  }

  async createWorkflow(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateWorkflowDto) {
    const workflow = await this.workflows.save(this.workflows.create({
      tenantId: tenant.tenantId,
      name: dto.name,
      description: dto.description ?? null,
      status: 'draft',
      currentVersion: 1,
      sandboxMode: dto.sandboxMode ?? false,
      allowedRoles: dto.allowedRoles ?? ['manager', 'admin'],
      metadata: {},
    }));
    const version = await this.versions.save(this.versions.create({
      tenantId: tenant.tenantId,
      workflowId: workflow.id,
      version: 1,
      canvasDefinition: { nodes: [], edges: [] },
      publishedAt: null,
      createdBy: user?.id ?? null,
    }));
    await this.audit(tenant, user, 'orchestration.workflow_created', 'workflow', workflow.id, { name: dto.name });
    return { workflow, version };
  }

  async updateWorkflow(tenant: TenantContext, user: AuthenticatedUser | undefined, workflowId: string, dto: UpdateWorkflowDto) {
    const workflow = await this.workflows.findOne({ where: { tenantId: tenant.tenantId, id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    Object.assign(workflow, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.sandboxMode !== undefined ? { sandboxMode: dto.sandboxMode } : {}),
      ...(dto.allowedRoles !== undefined ? { allowedRoles: dto.allowedRoles } : {}),
      updatedAt: new Date(),
    });
    const saved = await this.workflows.save(workflow);
    await this.audit(tenant, user, 'orchestration.workflow_updated', 'workflow', saved.id, { ...dto });
    return saved;
  }

  async publishVersion(tenant: TenantContext, user: AuthenticatedUser | undefined, workflowId: string) {
    const workflow = await this.workflows.findOne({ where: { tenantId: tenant.tenantId, id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    const current = await this.versions.findOne({
      where: { tenantId: tenant.tenantId, workflowId, version: workflow.currentVersion },
    });
    if (!current) throw new NotFoundException('Workflow version not found');

    const nextVersion = workflow.currentVersion + 1;
    const snapshot = await this.versions.save(this.versions.create({
      tenantId: tenant.tenantId,
      workflowId,
      version: nextVersion,
      canvasDefinition: current.canvasDefinition,
      publishedAt: new Date(),
      createdBy: user?.id ?? null,
    }));
    const existingSteps = await this.steps.find({ where: { tenantId: tenant.tenantId, workflowVersionId: current.id } });
    for (const step of existingSteps) {
      await this.steps.save(this.steps.create({
        tenantId: step.tenantId,
        workflowId: step.workflowId,
        workflowVersionId: snapshot.id,
        stepKey: step.stepKey,
        stepType: step.stepType,
        label: step.label,
        stepOrder: step.stepOrder,
        config: step.config,
        branchGroup: step.branchGroup,
        parallelGroup: step.parallelGroup,
        onErrorPath: step.onErrorPath,
        nextOnSuccess: step.nextOnSuccess,
        nextOnFailure: step.nextOnFailure,
        maxRetries: step.maxRetries,
        metadata: step.metadata,
      }));
    }
    workflow.currentVersion = nextVersion;
    workflow.status = 'active';
    workflow.updatedAt = new Date();
    current.publishedAt = new Date();
    await this.versions.save(current);
    await this.workflows.save(workflow);
    await this.audit(tenant, user, 'orchestration.version_published', 'workflow_version', snapshot.id, { version: nextVersion });
    return { workflow, version: snapshot };
  }

  async saveCanvas(tenant: TenantContext, user: AuthenticatedUser | undefined, workflowId: string, dto: SaveWorkflowCanvasDto) {
    const workflow = await this.workflows.findOne({ where: { tenantId: tenant.tenantId, id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    const version = await this.versions.findOne({
      where: { tenantId: tenant.tenantId, workflowId, version: workflow.currentVersion },
    });
    if (!version) throw new NotFoundException('Workflow version not found');

    version.canvasDefinition = { nodes: dto.nodes, edges: dto.edges };
    await this.versions.save(version);

    if (dto.steps?.length) {
      await this.steps.delete({ tenantId: tenant.tenantId, workflowVersionId: version.id });
      for (const step of dto.steps) {
        await this.upsertStep(tenant, workflowId, version.id, step);
      }
    }
    workflow.updatedAt = new Date();
    await this.workflows.save(workflow);
    await this.audit(tenant, user, 'orchestration.canvas_saved', 'workflow', workflowId, { stepCount: dto.steps?.length ?? 0 });
    return this.getWorkflow(tenant, workflowId);
  }

  async upsertTrigger(tenant: TenantContext, user: AuthenticatedUser | undefined, workflowId: string, dto: UpsertWorkflowTriggerDto) {
    let trigger = await this.triggers.findOne({ where: { tenantId: tenant.tenantId, workflowId, triggerType: dto.triggerType } });
    trigger ??= this.triggers.create({ tenantId: tenant.tenantId, workflowId, triggerType: dto.triggerType, config: {}, isActive: true, lastFiredAt: null });
    trigger.config = dto.config;
    trigger.isActive = dto.isActive ?? true;
    trigger.updatedAt = new Date();
    const saved = await this.triggers.save(trigger);
    await this.audit(tenant, user, 'orchestration.trigger_updated', 'workflow_trigger', saved.id, { triggerType: dto.triggerType });
    return saved;
  }

  async listRuns(tenant: TenantContext, workflowId?: string) {
    return this.runs.find({
      where: { tenantId: tenant.tenantId, ...(workflowId ? { workflowId } : {}) },
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async getRun(tenant: TenantContext, runId: string) {
    const run = await this.runs.findOne({ where: { tenantId: tenant.tenantId, id: runId } });
    if (!run) throw new NotFoundException('Workflow run not found');
    const stepRunRows = await this.stepRuns.find({
      where: { tenantId: tenant.tenantId, workflowRunId: runId },
      order: { startedAt: 'ASC' },
    });
    return { run, stepRuns: stepRunRows };
  }

  async startRun(tenant: TenantContext, user: AuthenticatedUser | undefined, workflowId: string, dto: StartWorkflowRunDto) {
    const workflow = await this.workflows.findOne({ where: { tenantId: tenant.tenantId, id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (workflow.status !== 'active' && workflow.status !== 'draft' && !dto.sandbox) {
      throw new BadRequestException('Workflow is not active');
    }

    if (dto.idempotencyKey) {
      const existing = await this.runs.findOne({ where: { tenantId: tenant.tenantId, idempotencyKey: dto.idempotencyKey } });
      if (existing) return this.getRun(tenant, existing.id);
    }

    const version = await this.versions.findOne({
      where: { tenantId: tenant.tenantId, workflowId, version: workflow.currentVersion },
    });
    if (!version) throw new NotFoundException('Workflow version not found');

    const run = await this.runs.save(this.runs.create({
      tenantId: tenant.tenantId,
      workflowId,
      workflowVersionId: version.id,
      version: workflow.currentVersion,
      status: 'running',
      triggerType: dto.sandbox ? 'sandbox' : 'manual',
      idempotencyKey: dto.idempotencyKey ?? null,
      sandboxRun: dto.sandbox ?? workflow.sandboxMode,
      context: dto.context ?? {},
      startedAt: new Date(),
      metrics: {},
    }));

    const result = await this.executeRun(tenant, user, run);
    await this.audit(tenant, user, 'orchestration.run_started', 'workflow_run', run.id, { workflowId, sandbox: run.sandboxRun });
    return result;
  }

  async triggerFromEvent(tenant: TenantContext, dto: TriggerEventDto) {
    const eventTriggers = await this.triggers.find({
      where: { tenantId: tenant.tenantId, triggerType: 'event', isActive: true },
    });
    const matched = eventTriggers.filter((t) => (t.config.topicKey as string | undefined) === dto.topicKey);
    const started = [];
    for (const trigger of matched) {
      const run = await this.startRun(tenant, undefined, trigger.workflowId, {
        context: { event: dto.payload, eventId: dto.eventId, topicKey: dto.topicKey },
      });
      trigger.lastFiredAt = new Date();
      await this.triggers.save(trigger);
      started.push(run);
    }
    return { triggered: started.length, runs: started };
  }

  async approvalInbox(tenant: TenantContext, userId: string) {
    return this.approvals.find({
      where: { tenantId: tenant.tenantId, assigneeUserId: userId, status: 'pending' },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async resolveApproval(tenant: TenantContext, user: AuthenticatedUser, approvalId: string, dto: ResolveApprovalDto) {
    const approval = await this.approvals.findOne({ where: { tenantId: tenant.tenantId, id: approvalId, assigneeUserId: user.id } });
    if (!approval) throw new NotFoundException('Approval not found');
    if (approval.status !== 'pending') throw new BadRequestException('Approval already resolved');

    approval.status = dto.decision === 'approved' ? 'approved' : 'rejected';
    approval.comment = dto.comment ?? null;
    approval.resolvedAt = new Date();
    await this.approvals.save(approval);

    const stepRun = await this.stepRuns.findOne({ where: { id: approval.workflowStepRunId } });
    const run = await this.runs.findOne({ where: { id: approval.workflowRunId } });
    if (!stepRun || !run) throw new NotFoundException('Run context not found');

    if (dto.decision === 'approved') {
      stepRun.status = 'succeeded';
      stepRun.output = { ...stepRun.output, approval: 'approved', comment: dto.comment };
      this.appendLog(stepRun, 'info', 'Approval granted');
      await this.stepRuns.save(stepRun);
      return this.resumeRun(tenant, user, run.id);
    }

    stepRun.status = 'failed';
    stepRun.errorTrace = dto.comment ?? 'Rejected by approver';
    run.status = 'failed';
    run.errorMessage = 'Approval rejected';
    run.finishedAt = new Date();
    await this.stepRuns.save(stepRun);
    await this.runs.save(run);
    return this.getRun(tenant, run.id);
  }

  async retryStepRun(tenant: TenantContext, user: AuthenticatedUser | undefined, stepRunId: string, dto: RetryStepRunDto) {
    const stepRun = await this.stepRuns.findOne({ where: { tenantId: tenant.tenantId, id: stepRunId } });
    if (!stepRun) throw new NotFoundException('Step run not found');
    const run = await this.runs.findOne({ where: { tenantId: tenant.tenantId, id: stepRun.workflowRunId } });
    if (!run) throw new NotFoundException('Workflow run not found');

    if (dto.resetAttempts) stepRun.attemptCount = 0;
    stepRun.status = 'pending';
    stepRun.errorTrace = null;
    await this.stepRuns.save(stepRun);

    await this.deadLetters.update({ workflowStepRunId: stepRunId }, { status: 'resolved', resolvedAt: new Date() });

    run.status = 'running';
    run.finishedAt = null;
    await this.runs.save(run);
    await this.audit(tenant, user, 'orchestration.step_retry', 'workflow_step_run', stepRunId, {});
    return this.resumeRun(tenant, user, run.id, stepRun.stepKey);
  }

  async listDeadLetters(tenant: TenantContext) {
    return this.deadLetters.find({ where: { tenantId: tenant.tenantId, status: 'open' }, order: { createdAt: 'DESC' }, take: 50 });
  }

  private async resumeRun(tenant: TenantContext, user: AuthenticatedUser | undefined, runId: string, fromStepKey?: string) {
    const run = await this.runs.findOne({ where: { tenantId: tenant.tenantId, id: runId } });
    if (!run) throw new NotFoundException('Workflow run not found');
    run.status = 'running';
    await this.runs.save(run);
    return this.executeRun(tenant, user, run, fromStepKey);
  }

  private async executeRun(tenant: TenantContext, user: AuthenticatedUser | undefined, run: WorkflowRunEntity, fromStepKey?: string) {
    const steps = await this.steps.find({
      where: { tenantId: tenant.tenantId, workflowVersionId: run.workflowVersionId },
      order: { stepOrder: 'ASC' },
    });
    const startIndex = fromStepKey ? Math.max(0, steps.findIndex((s) => s.stepKey === fromStepKey)) : 0;
    const context = { ...run.context };
    const startedAt = Date.now();

    for (let i = startIndex; i < steps.length; i += 1) {
      const step = steps[i];
      const parallelGroup = step.parallelGroup;
      if (parallelGroup) {
        const groupSteps = steps.filter((s) => s.parallelGroup === parallelGroup);
        const results = await Promise.all(groupSteps.map((s) => this.executeStep(tenant, user, run, s, context)));
        const failed = results.find((r) => r.status === 'failed' || r.status === 'dead_letter');
        if (failed) {
          run.status = 'failed';
          run.errorMessage = failed.errorTrace ?? 'Parallel step failed';
          run.finishedAt = new Date();
          await this.runs.save(run);
          return this.getRun(tenant, run.id);
        }
        i += groupSteps.length - 1;
        continue;
      }

      const stepResult = await this.executeStep(tenant, user, run, step, context);
      if (stepResult.status === 'waiting_approval') {
        run.status = 'waiting_approval';
        await this.runs.save(run);
        return this.getRun(tenant, run.id);
      }
      if (stepResult.status === 'failed' || stepResult.status === 'dead_letter') {
        const nextKey = step.onErrorPath ?? step.nextOnFailure;
        if (nextKey) {
          const jumpIndex = steps.findIndex((s) => s.stepKey === nextKey);
          if (jumpIndex >= 0) {
            i = jumpIndex - 1;
            continue;
          }
        }
        run.status = 'failed';
        run.errorMessage = stepResult.errorTrace ?? 'Step failed';
        run.finishedAt = new Date();
        await this.runs.save(run);
        return this.getRun(tenant, run.id);
      }

      if (step.stepType === 'condition') {
        const branch = stepResult.output.branch as string | undefined;
        const nextKey = branch === 'false' ? step.nextOnFailure : step.nextOnSuccess;
        if (nextKey) {
          const jumpIndex = steps.findIndex((s) => s.stepKey === nextKey);
          if (jumpIndex >= 0) i = jumpIndex - 1;
        }
      } else if (step.nextOnSuccess) {
        const jumpIndex = steps.findIndex((s) => s.stepKey === step.nextOnSuccess);
        if (jumpIndex >= 0) i = jumpIndex - 1;
      }

      Object.assign(context, stepResult.output);
    }

    run.status = 'succeeded';
    run.finishedAt = new Date();
    run.context = context;
    run.metrics = { durationMs: Date.now() - startedAt };
    await this.runs.save(run);
    return this.getRun(tenant, run.id);
  }

  private async executeStep(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    run: WorkflowRunEntity,
    step: WorkflowStepEntity,
    context: Record<string, unknown>,
  ) {
    const idempotencyKey = this.stepIdempotencyKey(run.id, step.stepKey, run.sandboxRun);
    const existing = await this.stepRuns.findOne({ where: { tenantId: tenant.tenantId, idempotencyKey, status: 'succeeded' } });
    if (existing) return existing;

    let stepRun = await this.stepRuns.findOne({ where: { tenantId: tenant.tenantId, workflowRunId: run.id, stepKey: step.stepKey } });
    stepRun ??= await this.stepRuns.save(this.stepRuns.create({
      tenantId: tenant.tenantId,
      workflowRunId: run.id,
      workflowStepId: step.id,
      stepKey: step.stepKey,
      status: 'pending',
      attemptCount: 0,
      input: { context, config: step.config },
      output: {},
      logs: [],
      idempotencyKey,
    }));

    stepRun.status = 'running';
    stepRun.attemptCount += 1;
    stepRun.startedAt = new Date();
    this.appendLog(stepRun, 'info', `Executing ${step.stepType}: ${step.label}`);
    await this.stepRuns.save(stepRun);

    try {
      if (run.sandboxRun) {
        stepRun.output = { sandbox: true, simulated: true, stepType: step.stepType };
        stepRun.status = 'succeeded';
        this.appendLog(stepRun, 'info', 'Sandbox simulation succeeded');
      } else {
        stepRun.output = await this.runStepHandler(tenant, user, run, step, context, stepRun);
        stepRun.status = step.stepType === 'approval' && stepRun.output.pendingApproval ? 'waiting_approval' : 'succeeded';
      }
      stepRun.finishedAt = new Date();
      await this.stepRuns.save(stepRun);
      return stepRun;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Step execution failed';
      stepRun.status = stepRun.attemptCount < step.maxRetries ? 'failed' : 'dead_letter';
      stepRun.errorTrace = message;
      stepRun.finishedAt = new Date();
      this.appendLog(stepRun, 'error', message);
      await this.stepRuns.save(stepRun);

      if (stepRun.status === 'dead_letter') {
        await this.deadLetters.save(this.deadLetters.create({
          tenantId: tenant.tenantId,
          workflowRunId: run.id,
          workflowStepRunId: stepRun.id,
          status: 'open',
          errorMessage: message,
          payload: { stepKey: step.stepKey, input: stepRun.input },
          attempts: stepRun.attemptCount,
        }));
      }
      return stepRun;
    }
  }

  private async runStepHandler(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    run: WorkflowRunEntity,
    step: WorkflowStepEntity,
    context: Record<string, unknown>,
    stepRun: WorkflowStepRunEntity,
  ): Promise<Record<string, unknown>> {
    const config = step.config;
    switch (step.stepType) {
      case 'data_fetch': {
        const source = config.source as string;
        if (source === 'event_bus') {
          const topicKey = config.topicKey as string;
          const events = await this.eventStore.find({
            where: { tenantId: tenant.tenantId, topicKey },
            order: { createdAt: 'DESC' },
            take: Number(config.limit ?? 10),
          });
          return { rows: events, count: events.length };
        }
        if (source === 'data_lake') {
          return { rows: [], count: 0, note: 'Data Lake query via warehouse table key', tableKey: config.tableKey };
        }
        return { rows: [], count: 0 };
      }
      case 'condition': {
        const field = config.field as string;
        const operator = config.operator as string;
        const expected = config.value;
        const actual = this.resolvePath(context, field);
        const result = this.evaluateCondition(actual, operator, expected);
        return { branch: result ? 'true' : 'false', actual, expected };
      }
      case 'delay': {
        const ms = Math.min(Number(config.milliseconds ?? 0), run.sandboxRun ? 0 : 5000);
        if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
        return { delayedMs: ms };
      }
      case 'approval': {
        const assignees = (config.assigneeUserIds as string[]) ?? (user?.id ? [user.id] : []);
        if (!assignees.length) throw new BadRequestException('Approval step requires assignees');
        for (const assigneeUserId of assignees) {
          await this.approvals.save(this.approvals.create({
            tenantId: tenant.tenantId,
            workflowRunId: run.id,
            workflowStepRunId: stepRun.id,
            assigneeUserId,
            status: 'pending',
            escalationLevel: 0,
            escalateAfterMinutes: Number(config.escalateAfterMinutes ?? 60),
            dueAt: new Date(Date.now() + Number(config.escalateAfterMinutes ?? 60) * 60 * 1000),
          }));
        }
        return { pendingApproval: true, assignees };
      }
      case 'notification': {
        const channel = (config.channel as string) ?? 'in_app';
        await this.notifications.dispatchEvent(
          tenant.tenantId,
          'orchestration.notification',
          {
            title: String(config.title ?? 'Workflow notification'),
            body: String(config.body ?? 'Automated workflow step'),
            workflowRunId: run.id,
            stepKey: step.stepKey,
          },
          { channel: channel as never },
        ).catch(() => null);
        return { sent: true, channel };
      }
      case 'entity_mutation':
        return { entity: config.entityType, action: config.action, sandbox: run.sandboxRun, persisted: !run.sandboxRun };
      case 'integration':
        return { connector: config.connector, webhookUrl: config.webhookUrl, status: 'dispatched' };
      case 'ai_action':
        return { action: config.actionType ?? 'generate_summary', summary: 'AI step output placeholder', integration: 'ai_assistant' };
      case 'custom_code': {
        const expression = String(config.expression ?? 'true');
        if (/eval|function|import|require|process/i.test(expression)) {
          throw new BadRequestException('Unsafe custom code expression blocked');
        }
        return { result: expression === 'true', sandboxed: true };
      }
      default:
        return {};
    }
  }

  private async upsertStep(tenant: TenantContext, workflowId: string, versionId: string, dto: UpsertWorkflowStepDto) {
    return this.steps.save(this.steps.create({
      tenantId: tenant.tenantId,
      workflowId,
      workflowVersionId: versionId,
      stepKey: dto.stepKey,
      stepType: dto.stepType,
      label: dto.label,
      stepOrder: dto.stepOrder,
      config: dto.config,
      branchGroup: dto.branchGroup ?? null,
      parallelGroup: dto.parallelGroup ?? null,
      onErrorPath: dto.onErrorPath ?? null,
      nextOnSuccess: dto.nextOnSuccess ?? null,
      nextOnFailure: dto.nextOnFailure ?? null,
      maxRetries: dto.maxRetries ?? 3,
      metadata: {},
    }));
  }

  private systemTenant(tenantId: string): TenantContext {
    return { tenantId, source: 'header' };
  }

  private async ensureSampleWorkflows(tenantId: string) {
    const count = await this.workflows.count({ where: { tenantId } });
    if (count > 0) return;

    const tenant = this.systemTenant(tenantId);
    const { workflow, version } = await this.createWorkflow(
      tenant,
      undefined,
      { name: 'Auto-PO Replenishment', description: 'Inventory replenishment with approval gate', sandboxMode: true },
    );
    await this.saveCanvas(
      tenant,
      undefined,
      workflow.id,
      {
        nodes: [
          { id: 'fetch', type: 'data_fetch', position: { x: 80, y: 120 } },
          { id: 'cond', type: 'condition', position: { x: 280, y: 120 } },
          { id: 'approve', type: 'approval', position: { x: 480, y: 120 } },
          { id: 'notify', type: 'notification', position: { x: 680, y: 120 } },
        ],
        edges: [
          { id: 'e1', source: 'fetch', target: 'cond' },
          { id: 'e2', source: 'cond', target: 'approve' },
          { id: 'e3', source: 'approve', target: 'notify' },
        ],
        steps: [
          { stepKey: 'fetch', stepType: 'data_fetch', label: 'Fetch inventory signals', stepOrder: 0, config: { source: 'data_lake', tableKey: 'fact_inventory_movements' } },
          { stepKey: 'cond', stepType: 'condition', label: 'Low stock?', stepOrder: 1, config: { field: 'rows.count', operator: 'gt', value: 0 }, nextOnSuccess: 'approve', nextOnFailure: 'notify' },
          { stepKey: 'approve', stepType: 'approval', label: 'Manager approval', stepOrder: 2, config: { assigneeUserIds: [], escalateAfterMinutes: 120 } },
          { stepKey: 'notify', stepType: 'notification', label: 'Notify procurement', stepOrder: 3, config: { channel: 'in_app', title: 'PO workflow', body: 'Replenishment workflow completed' } },
        ],
      },
    );
    await this.upsertTrigger(tenant, undefined, workflow.id, { triggerType: 'event', config: { topicKey: 'inventory' }, isActive: true });
    await this.upsertTrigger(tenant, undefined, workflow.id, { triggerType: 'schedule', config: { cron: '0 6 * * *' }, isActive: true });
    await this.upsertTrigger(tenant, undefined, workflow.id, { triggerType: 'manual', config: {}, isActive: true });
    workflow.status = 'active';
    await this.workflows.save(workflow);
    version.publishedAt = new Date();
    await this.versions.save(version);
  }

  private stepIdempotencyKey(runId: string, stepKey: string, sandbox: boolean) {
    return createHash('sha256').update(`${runId}:${stepKey}:${sandbox}`).digest('hex');
  }

  private appendLog(stepRun: WorkflowStepRunEntity, level: string, message: string) {
    stepRun.logs = [...(stepRun.logs ?? []), { at: new Date().toISOString(), level, message }];
  }

  private resolvePath(obj: Record<string, unknown>, path: string) {
    return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
  }

  private evaluateCondition(actual: unknown, operator: string, expected: unknown) {
    if (operator === 'eq') return actual === expected;
    if (operator === 'neq') return actual !== expected;
    if (operator === 'gt') return Number(actual) > Number(expected);
    if (operator === 'gte') return Number(actual) >= Number(expected);
    if (operator === 'lt') return Number(actual) < Number(expected);
    if (operator === 'contains') return String(actual).includes(String(expected));
    return Boolean(actual);
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'orchestration',
      metadata,
    });
  }
}
