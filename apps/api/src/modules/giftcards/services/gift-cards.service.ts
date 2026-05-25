import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { parseMoney } from '../../orders/domain/order-totals.util';
import { OrderEntity } from '../../orders/entities/order.entity';
import {
  CreateGiftCardDto,
  GiftCardAdjustDto,
  GiftCardDisableDto,
  GiftCardRedeemDto,
  StoreCreditDeductDto,
  StoreCreditMutationDto,
} from '../dto';
import {
  GiftCardEntity,
  GiftCardTransactionEntity,
  GiftCardTransactionType,
  StoreCreditTransactionEntity,
  StoreCreditTransactionType,
} from '../entities';

export type CreditQuote = {
  amount: string;
  giftCardId?: string;
  giftCardCode?: string;
};

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectRepository(GiftCardEntity)
    private readonly giftCards: Repository<GiftCardEntity>,
    @InjectRepository(GiftCardTransactionEntity)
    private readonly giftCardTransactions: Repository<GiftCardTransactionEntity>,
    @InjectRepository(StoreCreditTransactionEntity)
    private readonly storeCreditTransactions: Repository<StoreCreditTransactionEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async createGiftCard(tenant: TenantContext, dto: CreateGiftCardDto): Promise<GiftCardEntity> {
    if (dto.customerId) await this.requireCustomer(tenant.tenantId, dto.customerId);
    const code = this.normalizeCode(dto.code ?? this.generateCode());
    const existing = await this.giftCards.findOne({ where: { tenantId: tenant.tenantId, code } });
    if (existing) throw new BadRequestException('Gift card code already exists');

    const value = dto.initialValue.toFixed(2);
    const giftCard = await this.giftCards.save(
      this.giftCards.create({
        tenantId: tenant.tenantId,
        code,
        initialValue: value,
        balance: value,
        currency: dto.currency?.toUpperCase() ?? 'EUR',
        customerId: dto.customerId ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true,
      }),
    );
    await this.giftCardTransactions.save(
      this.giftCardTransactions.create({
        giftCardId: giftCard.id,
        amount: value,
        type: GiftCardTransactionType.ISSUE,
        orderId: null,
      }),
    );
    await this.notifyCustomer(giftCard.customerId, tenant.tenantId, 'Gift card issued', `A gift card worth ${value} ${giftCard.currency} was issued.`);
    return this.getGiftCardById(tenant.tenantId, giftCard.id);
  }

  async listGiftCards(tenant: TenantContext): Promise<GiftCardEntity[]> {
    return this.giftCards.find({
      where: { tenantId: tenant.tenantId },
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async listCustomerGiftCards(tenant: TenantContext, customerId: string): Promise<GiftCardEntity[]> {
    return this.giftCards.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async lookupGiftCard(tenant: TenantContext, code: string): Promise<GiftCardEntity> {
    const giftCard = await this.giftCards.findOne({
      where: { tenantId: tenant.tenantId, code: this.normalizeCode(code) },
      relations: { customer: true, transactions: true },
      order: { transactions: { createdAt: 'DESC' } },
    });
    if (!giftCard) throw new NotFoundException('Gift card not found');
    return giftCard;
  }

  async adjustGiftCard(tenant: TenantContext, dto: GiftCardAdjustDto): Promise<GiftCardEntity> {
    const giftCard = await this.getGiftCardById(tenant.tenantId, dto.giftCardId);
    const nextBalance = parseMoney(giftCard.balance) + dto.amount;
    if (nextBalance < 0) throw new BadRequestException('Adjustment would make gift card balance negative');
    giftCard.balance = nextBalance.toFixed(2);
    await this.giftCards.save(giftCard);
    await this.giftCardTransactions.save(
      this.giftCardTransactions.create({
        giftCardId: giftCard.id,
        amount: dto.amount.toFixed(2),
        type: GiftCardTransactionType.ADJUSTMENT,
        orderId: null,
      }),
    );
    return this.getGiftCardById(tenant.tenantId, giftCard.id);
  }

  async setGiftCardActive(tenant: TenantContext, dto: GiftCardDisableDto): Promise<GiftCardEntity> {
    const giftCard = await this.getGiftCardById(tenant.tenantId, dto.giftCardId);
    giftCard.isActive = dto.isActive;
    return this.giftCards.save(giftCard);
  }

  async quoteGiftCard(tenantId: string, code: string, requestedAmount: number, orderTotal: string): Promise<CreditQuote> {
    const giftCard = await this.requireRedeemableGiftCard(tenantId, code);
    const balance = parseMoney(giftCard.balance);
    const amount = Math.min(balance, requestedAmount, parseMoney(orderTotal));
    if (amount <= 0) throw new BadRequestException('Gift card has no redeemable balance');
    return { amount: amount.toFixed(2), giftCardId: giftCard.id, giftCardCode: giftCard.code };
  }

  async redeemGiftCard(tenant: TenantContext, dto: GiftCardRedeemDto): Promise<GiftCardEntity> {
    const giftCard = await this.requireRedeemableGiftCard(tenant.tenantId, dto.code);
    await this.applyGiftCardRedemption(tenant.tenantId, giftCard.id, dto.amount.toFixed(2), dto.orderId ?? null);
    return this.getGiftCardById(tenant.tenantId, giftCard.id);
  }

  async applyGiftCardRedemption(
    tenantId: string,
    giftCardId: string,
    amount: string,
    orderId: string | null,
  ): Promise<void> {
    const giftCard = await this.getGiftCardById(tenantId, giftCardId);
    const value = parseMoney(amount);
    if (value <= 0) return;
    if (parseMoney(giftCard.balance) < value) throw new BadRequestException('Gift card balance is too low');
    if (orderId) {
      const alreadyRedeemed = await this.giftCardTransactions.findOne({
        where: { giftCardId, orderId, type: GiftCardTransactionType.REDEEM },
      });
      if (alreadyRedeemed) return;
    }
    giftCard.balance = (parseMoney(giftCard.balance) - value).toFixed(2);
    await this.giftCards.save(giftCard);
    await this.giftCardTransactions.save(
      this.giftCardTransactions.create({
        giftCardId,
        amount: (-value).toFixed(2),
        type: GiftCardTransactionType.REDEEM,
        orderId,
      }),
    );
    await this.notifyCustomer(giftCard.customerId, tenantId, 'Gift card redeemed', `A gift card payment of ${value.toFixed(2)} ${giftCard.currency} was used.`);
  }

  async addStoreCredit(tenant: TenantContext, dto: StoreCreditMutationDto): Promise<StoreCreditTransactionEntity> {
    return this.applyStoreCreditMutation(
      tenant.tenantId,
      dto.customerId,
      dto.amount.toFixed(2),
      dto.type ?? StoreCreditTransactionType.ADJUSTMENT,
      dto.orderId ?? null,
    );
  }

  async deductStoreCredit(tenant: TenantContext, dto: StoreCreditDeductDto): Promise<StoreCreditTransactionEntity> {
    return this.applyStoreCreditMutation(
      tenant.tenantId,
      dto.customerId,
      (-dto.amount).toFixed(2),
      StoreCreditTransactionType.REDEEM,
      dto.orderId ?? null,
    );
  }

  async quoteStoreCredit(tenantId: string, customerId: string, requestedAmount: number, orderTotal: string): Promise<CreditQuote> {
    const customer = await this.requireCustomer(tenantId, customerId);
    const balance = parseMoney(customer.storeCreditBalance);
    const amount = Math.min(balance, requestedAmount, parseMoney(orderTotal));
    if (amount <= 0) throw new BadRequestException('Store credit has no redeemable balance');
    return { amount: amount.toFixed(2) };
  }

  async applyStoreCreditRedemption(
    tenantId: string,
    customerId: string,
    amount: string,
    orderId: string | null,
  ): Promise<void> {
    if (orderId) {
      const alreadyRedeemed = await this.storeCreditTransactions.findOne({
        where: { tenantId, customerId, orderId, type: StoreCreditTransactionType.REDEEM },
      });
      if (alreadyRedeemed) return;
    }
    await this.applyStoreCreditMutation(tenantId, customerId, `-${amount}`, StoreCreditTransactionType.REDEEM, orderId);
  }

  async listStoreCreditHistory(tenant: TenantContext, customerId: string): Promise<StoreCreditTransactionEntity[]> {
    return this.storeCreditTransactions.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getAnalytics(tenant: TenantContext): Promise<Record<string, unknown>> {
    const [giftCardSales, giftCardRedemptions, storeCreditIssued, storeCreditRedeemed] = await Promise.all([
      this.giftCardTransactions
        .createQueryBuilder('transaction')
        .innerJoin(GiftCardEntity, 'gift_card', 'gift_card.id = transaction.gift_card_id')
        .select('COALESCE(SUM(transaction.amount), 0)', 'value')
        .where('gift_card.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('transaction.type = :type', { type: GiftCardTransactionType.ISSUE })
        .getRawOne<{ value: string }>(),
      this.giftCardTransactions
        .createQueryBuilder('transaction')
        .innerJoin(GiftCardEntity, 'gift_card', 'gift_card.id = transaction.gift_card_id')
        .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'value')
        .where('gift_card.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('transaction.type = :type', { type: GiftCardTransactionType.REDEEM })
        .getRawOne<{ value: string }>(),
      this.storeCreditTransactions
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(transaction.amount), 0)', 'value')
        .where('transaction.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('transaction.type IN (:...types)', {
          types: [StoreCreditTransactionType.ADJUSTMENT, StoreCreditTransactionType.COMPENSATION, StoreCreditTransactionType.REFUND],
        })
        .getRawOne<{ value: string }>(),
      this.storeCreditTransactions
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'value')
        .where('transaction.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('transaction.type = :type', { type: StoreCreditTransactionType.REDEEM })
        .getRawOne<{ value: string }>(),
    ]);
    const liability = await this.giftCards
      .createQueryBuilder('gift_card')
      .select('COALESCE(SUM(gift_card.balance), 0)', 'value')
      .where('gift_card.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .andWhere('gift_card.is_active = true')
      .getRawOne<{ value: string }>();
    return {
      giftCardSales: Number(giftCardSales?.value ?? 0).toFixed(2),
      giftCardRedemptions: Number(giftCardRedemptions?.value ?? 0).toFixed(2),
      outstandingLiability: Number(liability?.value ?? 0).toFixed(2),
      storeCreditIssued: Number(storeCreditIssued?.value ?? 0).toFixed(2),
      storeCreditRedeemed: Number(storeCreditRedeemed?.value ?? 0).toFixed(2),
    };
  }

  async restoreCreditsForRefund(tenant: TenantContext, order: OrderEntity): Promise<void> {
    const giftRedemptions = await this.giftCardTransactions.find({
      where: { orderId: order.id, type: GiftCardTransactionType.REDEEM },
      relations: { giftCard: true },
    });
    for (const redemption of giftRedemptions) {
      if (redemption.giftCard.tenantId !== tenant.tenantId) continue;
      const existingRefund = await this.giftCardTransactions.findOne({
        where: {
          giftCardId: redemption.giftCardId,
          orderId: order.id,
          type: GiftCardTransactionType.REFUND,
        },
      });
      if (existingRefund) continue;
      const amount = Math.abs(parseMoney(redemption.amount));
      redemption.giftCard.balance = (parseMoney(redemption.giftCard.balance) + amount).toFixed(2);
      await this.giftCards.save(redemption.giftCard);
      await this.giftCardTransactions.save(
        this.giftCardTransactions.create({
          giftCardId: redemption.giftCardId,
          amount: amount.toFixed(2),
          type: GiftCardTransactionType.REFUND,
          orderId: order.id,
        }),
      );
    }

    if (!order.customerId) return;
    const storeRedemptions = await this.storeCreditTransactions.find({
      where: {
        tenantId: tenant.tenantId,
        customerId: order.customerId,
        orderId: order.id,
        type: StoreCreditTransactionType.REDEEM,
      },
    });
    for (const redemption of storeRedemptions) {
      const existingRefund = await this.storeCreditTransactions.findOne({
        where: {
          tenantId: tenant.tenantId,
          customerId: order.customerId,
          orderId: order.id,
          type: StoreCreditTransactionType.REFUND,
        },
      });
      if (existingRefund) continue;
      await this.applyStoreCreditMutation(
        tenant.tenantId,
        order.customerId,
        Math.abs(parseMoney(redemption.amount)).toFixed(2),
        StoreCreditTransactionType.REFUND,
        order.id,
      );
    }
  }

  private async applyStoreCreditMutation(
    tenantId: string,
    customerId: string,
    amount: string,
    type: StoreCreditTransactionType,
    orderId: string | null,
  ): Promise<StoreCreditTransactionEntity> {
    const customer = await this.requireCustomer(tenantId, customerId);
    const nextBalance = parseMoney(customer.storeCreditBalance) + parseMoney(amount);
    if (nextBalance < 0) throw new BadRequestException('Store credit balance is too low');
    customer.storeCreditBalance = nextBalance.toFixed(2);
    await this.customers.save(customer);
    const transaction = await this.storeCreditTransactions.save(
      this.storeCreditTransactions.create({ tenantId, customerId, amount, type, orderId }),
    );
    await this.notifyCustomer(
      customerId,
      tenantId,
      parseMoney(amount) >= 0 ? 'Store credit added' : 'Store credit used',
      parseMoney(amount) >= 0
        ? `Store credit of ${parseMoney(amount).toFixed(2)} was added.`
        : `Store credit of ${Math.abs(parseMoney(amount)).toFixed(2)} was used.`,
    );
    return transaction;
  }

  private async getGiftCardById(tenantId: string, id: string): Promise<GiftCardEntity> {
    const giftCard = await this.giftCards.findOne({
      where: { id, tenantId },
      relations: { customer: true, transactions: true },
      order: { transactions: { createdAt: 'DESC' } },
    });
    if (!giftCard) throw new NotFoundException('Gift card not found');
    return giftCard;
  }

  private async requireRedeemableGiftCard(tenantId: string, code: string): Promise<GiftCardEntity> {
    const giftCard = await this.lookupGiftCard({ tenantId, source: 'header' }, code);
    if (!giftCard.isActive) throw new BadRequestException('Gift card is disabled');
    if (giftCard.expiresAt && giftCard.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Gift card has expired');
    }
    if (parseMoney(giftCard.balance) <= 0) throw new BadRequestException('Gift card has no balance');
    return giftCard;
  }

  private async requireCustomer(tenantId: string, customerId: string): Promise<CustomerEntity> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/\s+/g, '');
  }

  private generateCode(): string {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `GC${random}`;
  }

  private async notifyCustomer(
    customerId: string | null,
    tenantId: string,
    title: string,
    message: string,
  ): Promise<void> {
    if (!customerId) return;
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId } });
    const recipient = customer?.email ?? customer?.phone;
    if (!recipient) return;
    await this.notifications.createAndSend(tenantId, {
      type: NotificationType.CUSTOMER,
      channel: customer?.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
      recipient,
      payload: { title, message, category: 'giftcards' },
    });
  }
}
