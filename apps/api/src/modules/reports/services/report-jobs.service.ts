import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterReportJobDto } from '../dto';
import { ReportJobResponseDto } from '../dto';
import { ReportJobEntity } from '../entities';

@Injectable()
export class ReportJobsService {
  constructor(
    @InjectRepository(ReportJobEntity)
    private readonly jobs: Repository<ReportJobEntity>,
  ) {}

  async findAll(tenant: TenantContext, query: FilterReportJobDto): Promise<ReportJobResponseDto[]> {
    const rows = await this.jobs.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.reportId ? { reportId: query.reportId } : {}),
      },
      order: { createdAt: 'DESC' },
      skip: ((query.page ?? 1) - 1) * (query.limit ?? 20),
      take: query.limit ?? 20,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(tenant: TenantContext, id: string): Promise<ReportJobResponseDto> {
    const row = await this.jobs.findOne({ where: { id, tenantId: tenant.tenantId } });
    if (!row) throw new NotFoundException('Report job not found');
    return this.toResponse(row);
  }

  private toResponse(row: ReportJobEntity): ReportJobResponseDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      reportId: row.reportId,
      definitionId: row.definitionId,
      reportType: row.reportType,
      format: row.format,
      status: row.status,
      fileUrl: row.fileUrl,
      parameters: row.parameters,
      locationId: row.locationId,
      requestedBy: row.requestedBy,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
