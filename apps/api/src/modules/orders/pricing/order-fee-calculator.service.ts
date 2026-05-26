import { Injectable, Logger } from '@nestjs/common';
import { OrderType } from '../enums/order-type.enum';
import { formatMoney } from '../domain/order-totals.util';
import { OrderPricingContext } from '../types/order-pricing.context';

export interface CalculateTaxInput {
  taxableSubtotal: number;
  context: OrderPricingContext;
}

export interface CalculateServiceChargeInput {
  subtotal: number;
  context: OrderPricingContext;
}

export interface CalculateDeliveryFeeInput {
  context: OrderPricingContext;
}

@Injectable()
export class OrderFeeCalculatorService {
  private readonly logger = new Logger(OrderFeeCalculatorService.name);

  calculateLineTax(lineSubtotal: number, _context: OrderPricingContext): string {
    this.logger.debug(`[tax-preview] line tax deferred to TaxCalculationService subtotal=${lineSubtotal}`);
    return formatMoney(0);
  }

  calculateTax(input: CalculateTaxInput): string {
    this.logger.debug(
      `[placeholder] calculateTax tenant=${input.context.tenant.tenantId} location=${input.context.locationId} taxable=${input.taxableSubtotal}`,
    );
    return formatMoney(0);
  }

  calculateServiceCharge(input: CalculateServiceChargeInput): string {
    this.logger.debug(
      `[placeholder] calculateServiceCharge orderType=${input.context.orderType} subtotal=${input.subtotal}`,
    );
    if (input.context.orderType === OrderType.DINE_IN) {
      return formatMoney(input.subtotal * 0.05);
    }
    return formatMoney(0);
  }

  calculateDeliveryFee(input: CalculateDeliveryFeeInput): string {
    this.logger.debug(
      `[placeholder] calculateDeliveryFee orderType=${input.context.orderType} location=${input.context.locationId}`,
    );
    if (input.context.orderType === OrderType.DELIVERY) {
      return formatMoney(3.99);
    }
    return formatMoney(0);
  }
}
