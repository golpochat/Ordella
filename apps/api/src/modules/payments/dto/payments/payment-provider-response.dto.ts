import { PaymentProvider } from '../../enums/payment-provider.enum';

export class PaymentProviderResponseDto {
  id!: PaymentProvider;
  name!: string;
  supportedMethods!: string[];
}
