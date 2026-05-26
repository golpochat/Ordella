import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateIntegrationProviderDto } from '../dto';
import { IntegrationProviderResponseDto } from '../dto';
import { UpdateIntegrationProviderDto } from '../dto';
import { IntegrationProviderEntity } from '../entities';
import { IntegrationProviderCategory } from '../enums/integration-provider-category.enum';

const BUILT_IN_PROVIDERS: Array<Pick<IntegrationProviderEntity, 'slug' | 'name' | 'category' | 'authType' | 'capabilities' | 'docsUrl' | 'configSchema' | 'isActive'>> = [
  { slug: 'xero', name: 'Xero', category: IntegrationProviderCategory.ACCOUNTING, authType: 'oauth2', capabilities: ['sales.sync', 'refunds.sync', 'taxes.sync', 'payouts.sync', 'purchase_orders.sync'], docsUrl: 'https://developer.xero.com/', isActive: true, configSchema: { fields: ['clientId', 'tenantId'], credentials: ['clientSecret', 'refreshToken'], phase: 1 } },
  { slug: 'quickbooks', name: 'QuickBooks', category: IntegrationProviderCategory.ACCOUNTING, authType: 'oauth2', capabilities: ['sales.sync', 'refunds.sync', 'taxes.sync', 'payouts.sync', 'purchase_orders.sync'], docsUrl: 'https://developer.intuit.com/', isActive: true, configSchema: { fields: ['clientId', 'realmId'], credentials: ['clientSecret', 'refreshToken'], phase: 1 } },
  { slug: 'sage', name: 'Sage', category: IntegrationProviderCategory.ACCOUNTING, authType: 'oauth2', capabilities: ['sales.sync', 'purchase_orders.sync'], docsUrl: 'https://developer.sage.com/', isActive: true, configSchema: { fields: ['clientId'], credentials: ['clientSecret'], phase: 2 } },
  { slug: 'sap', name: 'SAP', category: IntegrationProviderCategory.ERP, authType: 'oauth2', capabilities: ['products.sync', 'inventory.sync', 'suppliers.sync', 'purchase_orders.sync'], docsUrl: 'https://developers.sap.com/', isActive: true, configSchema: { fields: ['baseUrl', 'companyCode'], credentials: ['clientSecret'], phase: 1 } },
  { slug: 'oracle-netsuite', name: 'Oracle NetSuite', category: IntegrationProviderCategory.ERP, authType: 'oauth2', capabilities: ['products.sync', 'inventory.sync', 'suppliers.sync', 'purchase_orders.sync'], docsUrl: 'https://docs.oracle.com/en/cloud/saas/netsuite/', isActive: true, configSchema: { fields: ['accountId', 'consumerKey'], credentials: ['consumerSecret', 'tokenSecret'], phase: 1 } },
  { slug: 'microsoft-dynamics', name: 'Microsoft Dynamics', category: IntegrationProviderCategory.ERP, authType: 'oauth2', capabilities: ['products.sync', 'inventory.sync', 'suppliers.sync', 'purchase_orders.sync'], docsUrl: 'https://learn.microsoft.com/dynamics365/', isActive: true, configSchema: { fields: ['tenantId', 'environmentUrl'], credentials: ['clientSecret'], phase: 1 } },
  { slug: 'uber-direct', name: 'Uber Direct', category: IntegrationProviderCategory.DELIVERY, authType: 'api_key', capabilities: ['delivery.create', 'delivery.track', 'driver.assign', 'cost.reconcile'], docsUrl: 'https://developer.uber.com/docs/deliveries', isActive: true, configSchema: { fields: ['customerId'], credentials: ['apiKey'], events: ['delivery.created', 'delivery.updated'], phase: 1 } },
  { slug: 'doordash-drive', name: 'DoorDash Drive', category: IntegrationProviderCategory.DELIVERY, authType: 'api_key', capabilities: ['delivery.create', 'delivery.track', 'driver.assign', 'cost.reconcile'], docsUrl: 'https://developer.doordash.com/', isActive: true, configSchema: { fields: ['developerId', 'keyId'], credentials: ['signingSecret'], events: ['delivery.updated'], phase: 1 } },
  { slug: 'stuart', name: 'Stuart', category: IntegrationProviderCategory.DELIVERY, authType: 'api_key', capabilities: ['delivery.create', 'delivery.track', 'cost.reconcile'], docsUrl: 'https://api-docs.stuart.com/', isActive: true, configSchema: { fields: ['clientId'], credentials: ['clientSecret'], phase: 1 } },
  { slug: 'bringg', name: 'Bringg', category: IntegrationProviderCategory.DELIVERY, authType: 'api_key', capabilities: ['delivery.create', 'delivery.track', 'driver.assign'], docsUrl: 'https://developers.bringg.com/', isActive: true, configSchema: { fields: ['companyId'], credentials: ['accessToken'], phase: 2 } },
  { slug: 'mailchimp', name: 'Mailchimp', category: IntegrationProviderCategory.MARKETING, authType: 'oauth2', capabilities: ['customers.sync', 'campaigns.sync'], docsUrl: 'https://mailchimp.com/developer/', isActive: true, configSchema: { fields: ['audienceId'], credentials: ['accessToken'], phase: 1 } },
  { slug: 'klaviyo', name: 'Klaviyo', category: IntegrationProviderCategory.MARKETING, authType: 'api_key', capabilities: ['customers.sync', 'events.sync'], docsUrl: 'https://developers.klaviyo.com/', isActive: true, configSchema: { fields: ['listId'], credentials: ['apiKey'], phase: 1 } },
  { slug: 'ga4', name: 'Google Analytics 4', category: IntegrationProviderCategory.ANALYTICS, authType: 'api_key', capabilities: ['analytics.events'], docsUrl: 'https://developers.google.com/analytics', isActive: true, configSchema: { fields: ['measurementId'], credentials: ['apiSecret'], phase: 1 } },
  { slug: 'receipt-printers', name: 'Receipt Printers', category: IntegrationProviderCategory.HARDWARE, authType: 'none', capabilities: ['receipt.print'], docsUrl: null, isActive: true, configSchema: { fields: ['printerProfile', 'connectionMode'], phase: 1 } },
  { slug: 'barcode-scanners', name: 'Barcode Scanners', category: IntegrationProviderCategory.HARDWARE, authType: 'none', capabilities: ['barcode.scan'], docsUrl: null, isActive: true, configSchema: { fields: ['scannerProfile'], phase: 1 } },
  { slug: 'cash-drawers', name: 'Cash Drawers', category: IntegrationProviderCategory.HARDWARE, authType: 'none', capabilities: ['cash_drawer.open'], docsUrl: null, isActive: true, configSchema: { fields: ['drawerProfile'], phase: 1 } },
  { slug: 'scales', name: 'Scales', category: IntegrationProviderCategory.HARDWARE, authType: 'none', capabilities: ['scale.read'], docsUrl: null, isActive: true, configSchema: { fields: ['scaleProfile'], phase: 1 } },
  { slug: 'kiosks', name: 'Kiosks', category: IntegrationProviderCategory.HARDWARE, authType: 'none', capabilities: ['kiosk.order'], docsUrl: null, isActive: true, configSchema: { fields: ['kioskProfile'], phase: 2 } },
];

@Injectable()
export class IntegrationProvidersService {
  constructor(
    @InjectRepository(IntegrationProviderEntity)
    private readonly providers: Repository<IntegrationProviderEntity>,
  ) {}

  async findAll(query: FilterPaginationDto): Promise<IntegrationProviderResponseDto[]> {
    await this.ensureBuiltIns();
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const providers = await this.providers.find({ order: { category: 'ASC', name: 'ASC' }, skip: (page - 1) * limit, take: limit });
    return providers.map((provider) => this.toDto(provider));
  }

  async create(dto: CreateIntegrationProviderDto): Promise<IntegrationProviderResponseDto> {
    const provider = await this.providers.save(this.providers.create({
      slug: dto.slug,
      name: dto.name,
      category: dto.category,
      authType: (dto.authType as never) ?? 'api_key',
      capabilities: dto.capabilities ?? [],
      docsUrl: dto.docsUrl ?? null,
      configSchema: dto.configSchema ?? {},
      isActive: dto.isActive ?? true,
    }));
    return this.toDto(provider);
  }

  async findOne(id: string): Promise<IntegrationProviderResponseDto> {
    await this.ensureBuiltIns();
    const provider = await this.providers.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Integration provider not found');
    return this.toDto(provider);
  }

  async update(
    id: string,
    dto: UpdateIntegrationProviderDto,
  ): Promise<IntegrationProviderResponseDto> {
    const provider = await this.providers.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Integration provider not found');
    if (dto.name !== undefined) provider.name = dto.name;
    if (dto.category !== undefined) provider.category = dto.category;
    if (dto.authType !== undefined) provider.authType = dto.authType as never;
    if (dto.capabilities !== undefined) provider.capabilities = dto.capabilities;
    if (dto.docsUrl !== undefined) provider.docsUrl = dto.docsUrl;
    if (dto.configSchema !== undefined) provider.configSchema = dto.configSchema;
    if (dto.isActive !== undefined) provider.isActive = dto.isActive;
    return this.toDto(await this.providers.save(provider));
  }

  private async ensureBuiltIns(): Promise<void> {
    for (const row of BUILT_IN_PROVIDERS) {
      const existing = await this.providers.findOne({ where: { slug: row.slug } });
      if (!existing) {
        await this.providers.save(this.providers.create(row));
      } else if (!existing.capabilities?.length || existing.authType === 'api_key') {
        existing.authType = row.authType;
        existing.capabilities = row.capabilities;
        existing.docsUrl = row.docsUrl;
        existing.configSchema = { ...row.configSchema, ...existing.configSchema };
        await this.providers.save(existing);
      }
    }
  }

  private toDto(provider: IntegrationProviderEntity): IntegrationProviderResponseDto {
    return {
      id: provider.id,
      slug: provider.slug,
      name: provider.name,
      category: provider.category as IntegrationProviderCategory,
      authType: provider.authType,
      capabilities: provider.capabilities,
      docsUrl: provider.docsUrl,
      configSchema: provider.configSchema,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
