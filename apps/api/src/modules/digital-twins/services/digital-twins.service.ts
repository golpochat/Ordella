import { createHash, randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { ForecastSnapshotEntity } from '../../forecast/entities/forecast-snapshot.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import {
  CompareScenariosDto,
  CreateTwinDto,
  ForecastSandboxDto,
  ParallelSimulationsDto,
  RunSimulationDto,
  SaveScenarioDto,
} from '../dto';
import {
  DigitalTwinModelEntity,
  DigitalTwinVersionEntity,
  SimulationCacheEntity,
  SimulationDomain,
  SimulationResultEntity,
  SimulationRunEntity,
  SimulationScenarioEntity,
} from '../entities';

type SimParams = {
  priceIndex: number;
  staffingLevel: number;
  inventoryLevel: number;
  promoIntensity: number;
  seasonality: number;
  weatherImpact: number;
  supplyChainDelayDays: number;
};

@Injectable()
export class DigitalTwinsService {
  constructor(
    @InjectRepository(DigitalTwinModelEntity)
    private readonly twins: Repository<DigitalTwinModelEntity>,
    @InjectRepository(DigitalTwinVersionEntity)
    private readonly versions: Repository<DigitalTwinVersionEntity>,
    @InjectRepository(SimulationScenarioEntity)
    private readonly scenarios: Repository<SimulationScenarioEntity>,
    @InjectRepository(SimulationRunEntity)
    private readonly runs: Repository<SimulationRunEntity>,
    @InjectRepository(SimulationResultEntity)
    private readonly results: Repository<SimulationResultEntity>,
    @InjectRepository(SimulationCacheEntity)
    private readonly cache: Repository<SimulationCacheEntity>,
    @InjectRepository(ForecastSnapshotEntity)
    private readonly forecasts: Repository<ForecastSnapshotEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async dashboard(tenant: TenantContext) {
    await this.ensureSampleTwins(tenant.tenantId);
    const [twinCount, runCount, scenarioCount, cachedCount] = await Promise.all([
      this.twins.count({ where: { tenantId: tenant.tenantId } }),
      this.runs.count({ where: { tenantId: tenant.tenantId } }),
      this.scenarios.count({ where: { tenantId: tenant.tenantId } }),
      this.cache.count({ where: { tenantId: tenant.tenantId } }),
    ]);
    const recentRuns = await this.runs.find({
      where: { tenantId: tenant.tenantId },
      order: { startedAt: 'DESC' },
      take: 8,
    });
    return {
      twinCount,
      runCount,
      scenarioCount,
      cachedResults: cachedCount,
      recentRuns,
      domains: ['demand', 'inventory', 'staffing', 'delivery', 'pricing', 'promotion', 'customer_behavior', 'full'],
      integrations: ['data_lake', 'forecast', 'ai_assistant', 'orchestration'],
      sandboxOnly: true,
      gpuAcceleration: false,
    };
  }

  async listTwins(tenant: TenantContext) {
    await this.ensureSampleTwins(tenant.tenantId);
    return this.twins.find({ where: { tenantId: tenant.tenantId }, order: { updatedAt: 'DESC' } });
  }

  async getTwin(tenant: TenantContext, twinId: string) {
    const twin = await this.twins.findOne({ where: { tenantId: tenant.tenantId, id: twinId } });
    if (!twin) throw new NotFoundException('Digital twin not found');
    const [scenarioRows, runRows, versionRows] = await Promise.all([
      this.scenarios.find({ where: { tenantId: tenant.tenantId, twinId }, order: { updatedAt: 'DESC' } }),
      this.runs.find({ where: { tenantId: tenant.tenantId, twinId }, order: { startedAt: 'DESC' }, take: 20 }),
      this.versions.find({ where: { tenantId: tenant.tenantId, twinId }, order: { version: 'DESC' } }),
    ]);
    return { twin, scenarios: scenarioRows, runs: runRows, versions: versionRows };
  }

  async createTwin(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateTwinDto) {
    const baseline = dto.baselineData ?? await this.buildBaselineFromProduction(tenant.tenantId, dto.twinType);
    const twin = await this.twins.save(this.twins.create({
      tenantId: tenant.tenantId,
      name: dto.name,
      description: dto.description ?? null,
      twinType: dto.twinType,
      entityRefId: dto.entityRefId ?? null,
      currentVersion: 1,
      baselineData: baseline,
      simulationParameters: dto.simulationParameters ?? defaultParameters(),
      allowedRoles: ['manager', 'admin'],
      status: 'active',
      metadata: { sandboxOnly: true },
    }));
    await this.versions.save(this.versions.create({
      tenantId: tenant.tenantId,
      twinId: twin.id,
      version: 1,
      baselineData: baseline,
      simulationParameters: twin.simulationParameters,
      publishedAt: new Date(),
      createdBy: user?.id ?? null,
    }));
    await this.scenarios.save(this.scenarios.create({
      tenantId: tenant.tenantId,
      twinId: twin.id,
      name: 'Baseline',
      description: 'Default baseline scenario',
      parameters: defaultParameters(),
      forecastOverrides: {},
      extremeConditions: {},
      isBaseline: true,
      metadata: {},
    }));
    await this.audit(tenant, user, 'digital_twins.twin_created', 'digital_twin_model', twin.id, { name: dto.name });
    return twin;
  }

  async publishVersion(tenant: TenantContext, user: AuthenticatedUser | undefined, twinId: string) {
    const twin = await this.twins.findOne({ where: { tenantId: tenant.tenantId, id: twinId } });
    if (!twin) throw new NotFoundException('Digital twin not found');
    const next = twin.currentVersion + 1;
    const version = await this.versions.save(this.versions.create({
      tenantId: tenant.tenantId,
      twinId,
      version: next,
      baselineData: twin.baselineData,
      simulationParameters: twin.simulationParameters,
      publishedAt: new Date(),
      createdBy: user?.id ?? null,
    }));
    twin.currentVersion = next;
    twin.updatedAt = new Date();
    await this.twins.save(twin);
    await this.audit(tenant, user, 'digital_twins.version_published', 'digital_twin_version', version.id, { version: next });
    return version;
  }

  async saveScenario(tenant: TenantContext, user: AuthenticatedUser | undefined, twinId: string, dto: SaveScenarioDto) {
    const twin = await this.twins.findOne({ where: { tenantId: tenant.tenantId, id: twinId } });
    if (!twin) throw new NotFoundException('Digital twin not found');
    let scenario = await this.scenarios.findOne({ where: { tenantId: tenant.tenantId, twinId, name: dto.name } });
    scenario ??= this.scenarios.create({
      tenantId: tenant.tenantId,
      twinId,
      name: dto.name,
      description: dto.description ?? null,
      parameters: dto.parameters,
      forecastOverrides: dto.forecastOverrides ?? {},
      extremeConditions: dto.extremeConditions ?? {},
      isBaseline: false,
      metadata: {},
    });
    scenario.parameters = dto.parameters;
    scenario.forecastOverrides = dto.forecastOverrides ?? {};
    scenario.extremeConditions = dto.extremeConditions ?? {};
    scenario.updatedAt = new Date();
    const saved = await this.scenarios.save(scenario);
    await this.audit(tenant, user, 'digital_twins.scenario_saved', 'simulation_scenario', saved.id, { name: dto.name });
    return saved;
  }

  async runSimulation(tenant: TenantContext, user: AuthenticatedUser | undefined, twinId: string, dto: RunSimulationDto) {
    const twin = await this.twins.findOne({ where: { tenantId: tenant.tenantId, id: twinId } });
    if (!twin) throw new NotFoundException('Digital twin not found');

    const scenario = dto.scenarioId
      ? await this.scenarios.findOne({ where: { tenantId: tenant.tenantId, id: dto.scenarioId } })
      : null;
    const params = this.mergeParameters(twin, scenario, dto.parameters);
    const domain = dto.simulationDomain ?? 'full';
    const seed = dto.reproducibilitySeed ?? this.buildSeed(twinId, params, domain);
    const cacheKey = this.cacheKey(twinId, params, domain, seed);

    if (dto.useCache !== false) {
      const cached = await this.cache.findOne({
        where: { tenantId: tenant.tenantId, cacheKey },
      });
      if (cached && cached.expiresAt > new Date()) {
        const cachedRun = await this.runs.findOne({ where: { id: cached.simulationRunId } });
        const cachedResult = await this.results.findOne({ where: { simulationRunId: cached.simulationRunId } });
        if (cachedRun && cachedResult) {
          return { run: { ...cachedRun, status: 'cached' as const }, result: cachedResult, fromCache: true };
        }
      }
    }

    const run = await this.runs.save(this.runs.create({
      tenantId: tenant.tenantId,
      twinId,
      scenarioId: scenario?.id ?? null,
      simulationDomain: domain,
      status: 'running',
      reproducibilitySeed: seed,
      cacheKey,
      batchId: null,
      sandboxMode: true,
      parameters: params,
      startedAt: new Date(),
    }));

    try {
      const forecastBaseline = await this.loadForecastBaseline(tenant.tenantId);
      const output = this.executeSimulation(twin, params, domain, seed, forecastBaseline, scenario?.extremeConditions ?? {});
      const baselineKpis = this.kpisFromBaseline(twin.baselineData);
      const deltas = this.computeDeltas(baselineKpis, output.kpis);

      const result = await this.results.save(this.results.create({
        tenantId: tenant.tenantId,
        simulationRunId: run.id,
        kpis: output.kpis,
        charts: output.charts,
        metrics: output.metrics,
        baselineDeltas: deltas,
        riskAnalysis: this.riskAnalysis(deltas, params),
        recommendedActions: this.recommendations(deltas, params),
        confidenceIntervals: output.confidenceIntervals,
        aiExplanation: this.explainResults(deltas, domain),
      }));

      run.status = 'succeeded';
      run.finishedAt = new Date();
      await this.runs.save(run);

      await this.cache.save(this.cache.create({
        tenantId: tenant.tenantId,
        cacheKey,
        simulationRunId: run.id,
        resultHash: createHash('sha256').update(JSON.stringify(output.kpis)).digest('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }));

      await this.audit(tenant, user, 'digital_twins.simulation_run', 'simulation_run', run.id, { domain, seed });
      return { run, result, fromCache: false };
    } catch (error) {
      run.status = 'failed';
      run.errorMessage = error instanceof Error ? error.message : 'Simulation failed';
      run.finishedAt = new Date();
      await this.runs.save(run);
      throw error;
    }
  }

  async runParallel(tenant: TenantContext, user: AuthenticatedUser | undefined, twinId: string, dto: ParallelSimulationsDto) {
    const batchId = randomUUID();
    const outcomes = await Promise.all(
      dto.scenarios.map((item) =>
        this.runSimulation(tenant, user, twinId, {
          scenarioId: item.scenarioId,
          parameters: item.parameters,
          simulationDomain: dto.simulationDomain ?? 'full',
          useCache: true,
        }),
      ),
    );
    for (const outcome of outcomes) {
      outcome.run.batchId = batchId;
      await this.runs.save(outcome.run);
    }
    return { batchId, results: outcomes };
  }

  async compareScenarios(tenant: TenantContext, twinId: string, dto: CompareScenariosDto) {
    const comparisons = [];
    for (const scenarioId of dto.scenarioIds) {
      const { run, result } = await this.runSimulation(tenant, undefined, twinId, {
        scenarioId,
        simulationDomain: dto.simulationDomain ?? 'full',
        useCache: true,
      });
      comparisons.push({
        scenarioId,
        runId: run.id,
        kpis: result.kpis,
        baselineDeltas: result.baselineDeltas,
        charts: result.charts,
      });
    }
    return {
      twinId,
      comparisons,
      summary: this.compareSummary(comparisons),
    };
  }

  async forecastSandbox(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: ForecastSandboxDto) {
    const twin = await this.twins.findOne({ where: { tenantId: tenant.tenantId, id: dto.twinId } });
    if (!twin) throw new NotFoundException('Digital twin not found');

    const snapshots = await this.forecasts.find({
      where: { tenantId: tenant.tenantId },
      order: { generatedAt: 'DESC' },
      take: 5,
    });
    const variant = dto.modelVariant ?? 'default';
    const overrides = dto.assumptionOverrides ?? {};
    const extreme = dto.extremeConditions ?? {};
    const seed = this.buildSeed(dto.twinId, { ...overrides, ...extreme }, 'demand');

    const params = this.mergeParameters(twin, null, overrides);
    const output = this.executeSimulation(twin, params, 'demand', seed, snapshots, extreme);

    await this.audit(tenant, user, 'digital_twins.forecast_sandbox', 'digital_twin_model', twin.id, { variant });
    return {
      modelVariant: variant,
      forecastSnapshots: snapshots.length,
      alternativeProjection: output.kpis,
      confidenceIntervals: output.confidenceIntervals,
      extremeConditionsApplied: extreme,
      note: 'Sandbox forecast — does not write to production forecast tables.',
    };
  }

  async getRun(tenant: TenantContext, runId: string) {
    const run = await this.runs.findOne({ where: { tenantId: tenant.tenantId, id: runId } });
    if (!run) throw new NotFoundException('Simulation run not found');
    const result = await this.results.findOne({ where: { simulationRunId: runId } });
    return { run, result };
  }

  private executeSimulation(
    twin: DigitalTwinModelEntity,
    params: Record<string, unknown>,
    domain: SimulationDomain,
    seed: string,
    forecastSnapshots: ForecastSnapshotEntity[] | unknown[],
    extreme: Record<string, unknown>,
  ) {
    const p = this.normalizeParams(params, extreme);
    const rng = this.createRng(seed);
    const baseline = twin.baselineData as Record<string, number>;
    const dailyOrders = Number(baseline.dailyOrders ?? 120);
    const avgBasket = Number(baseline.avgBasket ?? 42);

    const demandMult = (1 + p.seasonality * 0.15) * (1 + p.promoIntensity * 0.25) * (1 - p.weatherImpact * 0.1) * (rng() * 0.1 + 0.95);
    const priceElasticity = -1.2;
    const demandAfterPrice = demandMult * Math.pow(p.priceIndex, priceElasticity);
    const projectedOrders = dailyOrders * demandAfterPrice * 30;
    const revenue = projectedOrders * avgBasket * p.priceIndex;
    const cogsRate = 0.38;
    const margin = revenue * (1 - cogsRate) - revenue * 0.08 * p.promoIntensity;
    const stockoutRate = Math.max(0, 0.05 - p.inventoryLevel * 0.04 + p.supplyChainDelayDays * 0.01);
    const laborCost = Number(baseline.laborCostPerDay ?? 2400) * 30 * p.staffingLevel;
    const laborEfficiency = Math.min(1, 0.7 + p.staffingLevel * 0.25 - stockoutRate);
    const deliveryMinutes = Number(baseline.avgDeliveryMinutes ?? 32) * (1 + (1 - p.staffingLevel) * 0.2 + p.supplyChainDelayDays * 0.05);
    const promoLift = p.promoIntensity * 0.18 * (1 - p.promoIntensity * 0.3);
    const cannibalization = p.promoIntensity * 0.05;
    const churnRisk = Math.max(0, 0.12 - p.promoIntensity * 0.02 + (p.priceIndex - 1) * 0.15);
    const repeatRate = Math.min(0.95, 0.55 + p.promoIntensity * 0.08 - churnRisk * 0.2);

    const kpis: Record<string, number> = {};
    const charts: SimulationResultEntity['charts'] = [];

    if (domain === 'demand' || domain === 'full') {
      kpis.projectedOrders = round(projectedOrders);
      kpis.demandIndex = round(demandAfterPrice * 100);
      charts.push(chartSeries('demand', 'Demand trend', 14, () => projectedOrders / 30 * (rng() * 0.2 + 0.9)));
    }
    if (domain === 'inventory' || domain === 'full') {
      kpis.stockoutRate = round(stockoutRate * 100);
      kpis.inventoryTurnover = round(4.2 * p.inventoryLevel * (1 - stockoutRate));
      charts.push(chartSeries('stockouts', 'Stockout %', 14, () => stockoutRate * 100 * (rng() * 0.15 + 0.92)));
    }
    if (domain === 'staffing' || domain === 'full') {
      kpis.laborCost = round(laborCost);
      kpis.schedulingEfficiency = round(laborEfficiency * 100);
      charts.push(chartSeries('labor', 'Labor cost', 14, () => laborCost / 30 * (rng() * 0.1 + 0.95)));
    }
    if (domain === 'delivery' || domain === 'full') {
      kpis.avgDeliveryMinutes = round(deliveryMinutes);
      kpis.driverUtilization = round(72 * p.staffingLevel);
      charts.push(chartSeries('delivery', 'Delivery time (min)', 14, () => deliveryMinutes * (rng() * 0.08 + 0.96)));
    }
    if (domain === 'pricing' || domain === 'full') {
      kpis.revenue = round(revenue);
      kpis.margin = round(margin);
      charts.push(chartSeries('revenue', 'Revenue', 14, () => revenue / 30 * (rng() * 0.12 + 0.94)));
      charts.push(chartSeries('margin', 'Margin', 14, () => margin / 30 * (rng() * 0.12 + 0.94)));
    }
    if (domain === 'promotion' || domain === 'full') {
      kpis.promoLift = round(promoLift * 100);
      kpis.cannibalization = round(cannibalization * 100);
    }
    if (domain === 'customer_behavior' || domain === 'full') {
      kpis.churnRisk = round(churnRisk * 100);
      kpis.repeatRate = round(repeatRate * 100);
    }

    const confidenceIntervals: Record<string, { low: number; high: number }> = {};
    for (const [key, value] of Object.entries(kpis)) {
      const spread = value * 0.08;
      confidenceIntervals[key] = { low: round(value - spread), high: round(value + spread) };
    }

    return {
      kpis,
      charts,
      metrics: {
        reproducibilitySeed: seed,
        forecastSnapshotsUsed: Array.isArray(forecastSnapshots) ? forecastSnapshots.length : 0,
        twinType: twin.twinType,
        sandboxOnly: true,
      },
      confidenceIntervals,
    };
  }

  private async buildBaselineFromProduction(tenantId: string, twinType: string) {
    const orderCount = await this.orders.count({ where: { tenantId } });
    const recentOrders = await this.orders.find({ where: { tenantId }, take: 100, order: { createdAt: 'DESC' } });
    const revenue = recentOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgBasket = recentOrders.length ? revenue / recentOrders.length : 42;
    return {
      dailyOrders: Math.max(10, Math.round(orderCount / 30)),
      avgBasket,
      laborCostPerDay: 2400,
      avgDeliveryMinutes: 32,
      twinType,
      source: 'production_snapshot_readonly',
      snapshotAt: new Date().toISOString(),
    };
  }

  private async loadForecastBaseline(tenantId: string) {
    return this.forecasts.find({ where: { tenantId }, order: { generatedAt: 'DESC' }, take: 3 });
  }

  private mergeParameters(
    twin: DigitalTwinModelEntity,
    scenario: SimulationScenarioEntity | null,
    overrides?: Record<string, unknown>,
  ) {
    return {
      ...defaultParameters(),
      ...twin.simulationParameters,
      ...(scenario?.parameters ?? {}),
      ...(overrides ?? {}),
    };
  }

  private normalizeParams(params: Record<string, unknown>, extreme: Record<string, unknown>): SimParams {
    return {
      priceIndex: num(params.priceIndex, 1),
      staffingLevel: num(params.staffingLevel, 1),
      inventoryLevel: num(params.inventoryLevel, 1),
      promoIntensity: num(params.promoIntensity, 0),
      seasonality: num(params.seasonality, 0),
      weatherImpact: num(extreme.weatherImpact ?? params.weatherImpact, 0),
      supplyChainDelayDays: num(extreme.supplyChainDelayDays ?? params.supplyChainDelayDays, 0),
    };
  }

  private kpisFromBaseline(baseline: Record<string, unknown>) {
    const dailyOrders = Number(baseline.dailyOrders ?? 120);
    const avgBasket = Number(baseline.avgBasket ?? 42);
    return {
      revenue: round(dailyOrders * avgBasket * 30),
      margin: round(dailyOrders * avgBasket * 30 * 0.54),
      stockoutRate: 5,
      laborCost: round(Number(baseline.laborCostPerDay ?? 2400) * 30),
      avgDeliveryMinutes: Number(baseline.avgDeliveryMinutes ?? 32),
    };
  }

  private computeDeltas(baseline: Record<string, number>, simulated: Record<string, number>) {
    const deltas: Record<string, number> = {};
    for (const key of new Set([...Object.keys(baseline), ...Object.keys(simulated)])) {
      const b = baseline[key] ?? 0;
      const s = simulated[key] ?? 0;
      deltas[key] = b === 0 ? s : round(((s - b) / b) * 100);
    }
    return deltas;
  }

  private riskAnalysis(deltas: Record<string, number>, params: Record<string, unknown>) {
    const risks = [];
    if ((deltas.stockoutRate ?? 0) > 10) risks.push({ level: 'high', area: 'inventory', message: 'Stockout rate materially above baseline' });
    if ((deltas.churnRisk ?? 0) > 15) risks.push({ level: 'medium', area: 'customers', message: 'Churn risk elevated under current pricing/promo mix' });
    if (num(params.supplyChainDelayDays, 0) > 3) risks.push({ level: 'high', area: 'supply_chain', message: 'Supply chain delays may impact delivery SLAs' });
    if (!risks.length) risks.push({ level: 'low', area: 'general', message: 'Scenario within acceptable operating bounds' });
    return risks;
  }

  private recommendations(deltas: Record<string, number>, params: Record<string, unknown>) {
    const actions = [];
    if ((deltas.stockoutRate ?? 0) > 5) actions.push({ action: 'increase_safety_stock', priority: 'high' });
    if ((deltas.margin ?? 0) < -5) actions.push({ action: 'review_pricing_and_promo', priority: 'medium' });
    if (num(params.staffingLevel, 1) < 0.85) actions.push({ action: 'add_peak_staffing', priority: 'medium' });
    if (!actions.length) actions.push({ action: 'maintain_current_plan', priority: 'low' });
    return actions;
  }

  private explainResults(deltas: Record<string, number>, domain: string) {
    return `AI summary (${domain}): Revenue ${formatDelta(deltas.revenue)}, margin ${formatDelta(deltas.margin)}, stockouts ${formatDelta(deltas.stockoutRate)} vs baseline. Connect AI Assistant for narrative drill-down.`;
  }

  private compareSummary(comparisons: Array<{ scenarioId: string; baselineDeltas: Record<string, number> }>) {
    const bestRevenue = [...comparisons].sort((a, b) => (b.baselineDeltas.revenue ?? 0) - (a.baselineDeltas.revenue ?? 0))[0];
    return { bestRevenueScenarioId: bestRevenue?.scenarioId ?? null, compared: comparisons.length };
  }

  private cacheKey(twinId: string, params: Record<string, unknown>, domain: string, seed: string) {
    return createHash('sha256').update(JSON.stringify({ twinId, params, domain, seed })).digest('hex').slice(0, 64);
  }

  private buildSeed(twinId: string, params: Record<string, unknown>, domain: string) {
    return createHash('sha256').update(JSON.stringify({ twinId, params, domain })).digest('hex').slice(0, 16);
  }

  private createRng(seed: string) {
    let a = 0;
    for (let i = 0; i < seed.length; i += 1) a = ((a << 5) - a + seed.charCodeAt(i)) | 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) | 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private systemTenant(tenantId: string): TenantContext {
    return { tenantId, source: 'header' };
  }

  private async ensureSampleTwins(tenantId: string) {
    if (await this.twins.count({ where: { tenantId } })) return;
    const tenant = this.systemTenant(tenantId);
    await this.createTwin(tenant, undefined, {
      name: 'Flagship Store Twin',
      description: 'Store-level digital twin for demand, staffing, and delivery simulations',
      twinType: 'store',
    });
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'digital_twins',
      metadata,
    });
  }
}

function defaultParameters() {
  return {
    priceIndex: 1,
    staffingLevel: 1,
    inventoryLevel: 1,
    promoIntensity: 0,
    seasonality: 0,
    weatherImpact: 0,
    supplyChainDelayDays: 0,
  };
}

function num(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function chartSeries(key: string, label: string, days: number, fn: () => number) {
  const series = [];
  for (let i = 0; i < days; i += 1) {
    series.push({ x: `D${i + 1}`, y: round(fn()) });
  }
  return { key, label, series };
}

function formatDelta(delta?: number) {
  if (delta === undefined) return 'n/a';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}
