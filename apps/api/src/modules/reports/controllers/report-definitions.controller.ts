import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { CreateReportDefinitionDto } from '../dto/report-definitions/create-report-definition.dto';
import { ReportDefinitionResponseDto } from '../dto/report-definitions/report-definition-response.dto';
import { UpdateReportDefinitionDto } from '../dto/report-definitions/update-report-definition.dto';
import { ReportDefinitionsService } from '../services/report-definitions.service';

@Controller('report-definitions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReportDefinitionsController {
  constructor(private readonly reportDefinitionsService: ReportDefinitionsService) {}

  @Get()
  @RequirePermissions(ReportsPermissionKeys.REPORT_DEFINITIONS_READ)
  async findAll(
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<ReportDefinitionResponseDto[]>> {
    const data = await this.reportDefinitionsService.findAll(query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(ReportsPermissionKeys.REPORT_DEFINITIONS_CREATE)
  async create(
    @Body() dto: CreateReportDefinitionDto,
  ): Promise<ApiSuccessResponse<ReportDefinitionResponseDto>> {
    const data = await this.reportDefinitionsService.create(dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(ReportsPermissionKeys.REPORT_DEFINITIONS_READ)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ReportDefinitionResponseDto>> {
    const data = await this.reportDefinitionsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(ReportsPermissionKeys.REPORT_DEFINITIONS_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDefinitionDto,
  ): Promise<ApiSuccessResponse<ReportDefinitionResponseDto>> {
    const data = await this.reportDefinitionsService.update(id, dto);
    return { success: true, data };
  }
}
