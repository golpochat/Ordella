import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_ORDER_TAX_RATE } from '../constants/order-tax.constants';
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

/**
 * Placeholder fee rules — replace with tenant/location configuration later.
 */
@Injectable()
export class OrderFeeCalculatorService {
  private readonly logger = new Logger(OrderFeeCalculatorService.name);

  calculateLineTax(lineSubtotal: number, _context: OrderPricingContext): string {
    const tax = lineSubtotal * DEFAULT_ORDER_TAX_RATE;
    return formatMoney(tax);
  }

  calculateTax(input: CalculateTaxInput): string {
    this.logger.debug(
      `[placeholder] calculateTax tenant=${input.context.tenant.tenantId} location=${input.context.locationId} taxable=${input.taxableSubtotal}`,
    );
    const tax = input.taxableSubtotal * DEFAULT_ORDER_TAX_RATE;
    return formatMoney(tax);
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
