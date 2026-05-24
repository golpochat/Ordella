import { PaymentMethodType } from '../../enums/payment-method-type.enum';
import { PaymentProvider } from '../../enums/payment-provider.enum';

export class PaymentMethodResponseDto {
  id!: string;
  tenantId!: string;
  customerId!: string | null;
  type!: PaymentMethodType;
  provider!: PaymentProvider;
  displayLabel!: string | null;
  lastFour!: string | null;
  brand!: string | null;
  isDefault!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
