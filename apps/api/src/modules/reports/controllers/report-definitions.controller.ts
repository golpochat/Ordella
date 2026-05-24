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
import { ApiSuccessResponse } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { ReportsPermissionKeys } from '../constants/permission-keys';
import { CreateReportDefinitionDto } from '../dto';
import { ReportDefinitionResponseDto } from '../dto';
import { UpdateReportDefinitionDto } from '../dto';
import { ReportDefinitionsService } from '../services';

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
