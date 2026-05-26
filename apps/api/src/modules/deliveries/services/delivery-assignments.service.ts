import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterDeliveryAssignmentDto } from '../dto';
import { DeliveryAssignmentResponseDto } from '../dto';
import { CreateDeliveryAssignmentDto } from '../dto';
import { UpdateDeliveryAssignmentDto } from '../dto';
import { DeliveryAssignmentEntity } from '../entities';
import { DeliveryAssignmentStatus } from '../enums/delivery-assignment-status.enum';
import { DeliveryAssignmentType } from '../enums/delivery-assignment-type.enum';
import { DeliveryAssignmentRepository } from '../repositories/delivery-assignment.repository';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository';
import { DeliveryService } from './delivery.service';

@Injectable()
export class DeliveryAssignmentsService {
  constructor(
    private readonly assignmentRepository: DeliveryAssignmentRepository,
    private readonly taskRepository: DeliveryTaskRepository,
    private readonly deliveryService: DeliveryService,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto[]> {
    if (query.deliveryTaskId) {
      await this.requireTenantTask(tenant.tenantId, query.deliveryTaskId);
    }
    const rows = await this.assignmentRepository.findAll({
      deliveryTaskId: query.deliveryTaskId,
      driverProfileId: query.driverProfileId,
    });
    return rows.map(toAssignmentResponse);
  }

  async create(
    tenant: TenantContext,
    dto: CreateDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto> {
    await this.requireTenantTask(tenant.tenantId, dto.deliveryTaskId);
    const task = await this.deliveryService.assignDriver(
      tenant.tenantId,
      dto.deliveryTaskId,
      dto.driverProfileId,
      dto.assignmentType ?? DeliveryAssignmentType.MANUAL,
    );
    const rows = await this.assignmentRepository.findAll({
      deliveryTaskId: task.id,
      driverProfileId: dto.driverProfileId,
    });
    return toAssignmentResponse(rows[0]);
  }

  async findOne(tenant: TenantContext, id: string): Promise<DeliveryAssignmentResponseDto> {
    const assignment = await this.requireAssignmentForTenant(tenant.tenantId, id);
    return toAssignmentResponse(assignment);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateDeliveryAssignmentDto,
  ): Promise<DeliveryAssignmentResponseDto> {
    const assignment = await this.requireAssignmentForTenant(tenant.tenantId, id);
    if (dto.status !== undefined) {
      assignment.status = dto.status;
      if (dto.status === DeliveryAssignmentStatus.ACCEPTED && !assignment.acceptedAt) {
        assignment.acceptedAt = new Date();
      }
    }
    return toAssignmentResponse(await this.assignmentRepository.save(assignment));
  }

  private async requireTenantTask(tenantId: string, taskId: string) {
    const task = await this.taskRepository.findByIdForTenant(tenantId, taskId);
    if (!task) throw new NotFoundException('Delivery task not found');
    return task;
  }

  private async requireAssignmentForTenant(tenantId: string, id: string) {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) throw new NotFoundException('Delivery assignment not found');
    await this.requireTenantTask(tenantId, assignment.deliveryTaskId);
    return assignment;
  }
}

function toAssignmentResponse(assignment: DeliveryAssignmentEntity): DeliveryAssignmentResponseDto {
  return {
    id: assignment.id,
    deliveryTaskId: assignment.deliveryTaskId,
    driverProfileId: assignment.driverProfileId,
    assignmentType: assignment.assignmentType,
    status: assignment.status,
    assignedAt: assignment.assignedAt,
    acceptedAt: assignment.acceptedAt,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };
}
