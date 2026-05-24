import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { Public } from '../../auth';
import { ThemeRegistryService } from '../services/theme-registry.service';
import { DomainResolverService } from '../services/domain-resolver.service';

@Controller('public')
export class PublicThemeController {
  constructor(
    private readonly themeRegistry: ThemeRegistryService,
    private readonly domainResolver: DomainResolverService,
  ) {}

  @Public()
  @Get('theme/:tenantId')
  async getTheme(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.themeRegistry.getTheme(tenantId);
    return { success: true, data };
  }

  @Public()
  @Get('domain/resolve')
  async resolveDomain(@Query('domain') domain: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.domainResolver.resolveByDomain(domain);
    return { success: true, data };
  }
}
