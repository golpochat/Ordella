import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import {
  throwAlreadyDelivered,
  throwDeliveryTaskForOrderNotFound,
  throwDeliveryTaskNotFound,
  throwInactiveDriver,
} from '../domain/delivery-domain.errors';
import { assertDeliveryStatusTransition } from '../domain/delivery-status.transitions';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository';
import { DriverProfileRepository } from '../repositories/driver-profile.repository';
import { DeliveryStatusHistoryRepository } from '../repositories/delivery-status-history.repository';
import { DeliveryEventRepository } from '../repositories/delivery-event.repository';
import { DeliveryOrderContext, DeliveryOrderTransitionContext } from '../types/delivery-order.context';
import {
  DriverTrackingService,
  ExternalDeliveryProviderService,
  RouteOptimizationService,
} from '../integrations';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly taskRepository: DeliveryTaskRepository,
    private readonly driverRepository: DriverProfileRepository,
    private readonly statusHistoryRepository: DeliveryStatusHistoryRepository,
    private readonly eventRepository: DeliveryEventRepository,
    private readonly externalProviderService: ExternalDeliveryProviderService,
    private readonly routeOptimizationService: RouteOptimizationService,
    private readonly driverTrackingService: DriverTrackingService,
  ) {}

  async createTask(context: DeliveryOrderContext): Promise<DeliveryTaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.taskRepository.findByOrderForTenant(
        context.tenantId,
        context.orderId,
        manager,
        true,
      );
      if (existing) {
        return existing;
      }

      const task = this.taskRepository.create(
        {
          tenantId: context.tenantId,
          orderId: context.orderId,
          driverId: null,
          status: DeliveryTaskStatus.PENDING,
          eta: context.eta ?? null,
          startedAt: null,
          completedAt: null,
          metadata: context.metadata ?? {},
          deliveryFee: null,
          notes: null,
        },
        manager,
      );
      const saved = await this.taskRepository.save(task, manager);
      await this.recordEvent(context.tenantId, saved.id, 'delivery.task.created', {
        orderId: context.orderId,
      }, manager);
      await this.statusHistoryRepository.append(
        saved.id,
        null,
        DeliveryTaskStatus.PENDING,
        null,
        {},
        manager,
      );
      this.externalProviderService.notifyTaskCreated(saved);
      return saved;
    });
  }

  async assignDriver(tenantId: string, taskId: string, driverId: string): Promise<DeliveryTaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const task = await this.requireTask(tenantId, taskId, manager, true);
      const driver = await this.driverRepository.findByIdForTenant(tenantId, driverId, manager, true);
      if (!driver || !driver.active) {
        throwInactiveDriver(driverId);
      }

      assertDeliveryStatusTransition(task.status, DeliveryTaskStatus.ASSIGNED);
      const from = task.status;
      task.driverId = driver.id;
      task.status = DeliveryTaskStatus.ASSIGNED;
      await this.taskRepository.save(task, manager);

      await this.statusHistoryRepository.append(
        task.id,
        from,
        task.status,
        null,
        { driverId: driver.id },
        manager,
      );
      await this.recordEvent(tenantId, task.id, 'delivery.assigned', { driverId: driver.id }, manager);
      this.routeOptimizationService.optimize(task);
      return task;
    });
  }

  async markOutForDelivery(tenantId: string, taskId: string): Promise<DeliveryTaskEntity> {
    return this.transition(tenantId, taskId, DeliveryTaskStatus.EN_ROUTE, null, {
      eventType: 'delivery.out_for_delivery',
      setStartedAt: true,
      startTracking: true,
    });
  }

  async markDelivered(tenantId: string, taskId: string): Promise<DeliveryTaskEntity> {
    return this.transition(tenantId, taskId, DeliveryTaskStatus.DELIVERED, null, {
      eventType: 'delivery.delivered',
      setCompletedAt: true,
      stopTracking: true,
    });
  }

  async markFailed(tenantId: string, taskId: string, reason: string): Promise<DeliveryTaskEntity> {
    return this.transition(tenantId, taskId, DeliveryTaskStatus.FAILED, reason, {
      eventType: 'delivery.failed',
      stopTracking: true,
    });
  }

  async getTaskForOrder(tenantId: string, orderId: string): Promise<DeliveryTaskEntity> {
    const task = await this.taskRepository.findByOrderForTenant(tenantId, orderId);
    if (!task) {
      throwDeliveryTaskForOrderNotFound(orderId);
    }
    return task;
  }

  async recordEvent(
    tenantId: string,
    deliveryTaskId: string,
    type: string,
    payload: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<void> {
    await this.eventRepository.append(tenantId, deliveryTaskId, type, payload, manager);
  }

  async syncFromOrderTransition(context: DeliveryOrderTransitionContext): Promise<void> {
    if (context.toStatus === 'ready') {
      await this.createTask({ tenantId: context.tenantId, orderId: context.orderId });
      return;
    }

    const task = await this.getTaskForOrder(context.tenantId, context.orderId);

    if (context.toStatus === 'out_for_delivery') {
      await this.markOutForDelivery(context.tenantId, task.id);
      return;
    }
    if (context.toStatus === 'completed') {
      await this.markDelivered(context.tenantId, task.id);
      return;
    }
    if (context.toStatus === 'cancelled') {
      await this.markFailed(context.tenantId, task.id, context.reason ?? 'order_cancelled');
    }
  }

  private async transition(
    tenantId: string,
    taskId: string,
    to: DeliveryTaskStatus,
    reason: string | null,
    options: {
      eventType: string;
      setStartedAt?: boolean;
      setCompletedAt?: boolean;
      startTracking?: boolean;
      stopTracking?: boolean;
    },
  ): Promise<DeliveryTaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const task = await this.requireTask(tenantId, taskId, manager, true);

      if (task.status === DeliveryTaskStatus.DELIVERED && to === DeliveryTaskStatus.DELIVERED) {
        throwAlreadyDelivered(task.id);
      }
      assertDeliveryStatusTransition(task.status, to);

      const from = task.status;
      task.status = to;
      if (options.setStartedAt && !task.startedAt) {
        task.startedAt = new Date();
      }
      if (options.setCompletedAt) {
        task.completedAt = new Date();
      }
      await this.taskRepository.save(task, manager);

      await this.statusHistoryRepository.append(task.id, from, to, reason, {}, manager);
      await this.recordEvent(tenantId, task.id, options.eventType, { reason }, manager);

      if (options.startTracking) {
        this.driverTrackingService.start(task);
      }
      if (options.stopTracking) {
        this.driverTrackingService.stop(task);
      }
      return task;
    });
  }

  private async requireTask(
    tenantId: string,
    taskId: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<DeliveryTaskEntity> {
    const task = await this.taskRepository.findByIdForTenant(tenantId, taskId, manager, lock);
    if (!task) {
      throwDeliveryTaskNotFound(taskId);
    }
    return task;
  }
}
