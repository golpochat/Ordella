import { Module } from '@nestjs/common';
import { BillingModule } from '../../../billing/billing.module';
import { OrdersFeatureModule } from '../../../orders/modules/orders/orders-feature.module';
import { PaymentsTerminalController } from '../../controllers/payments-terminal.controller';
import { PaymentsTerminalService } from '../../services/payments-terminal.service';

@Module({
  imports: [BillingModule, OrdersFeatureModule],
  controllers: [PaymentsTerminalController],
  providers: [PaymentsTerminalService],
})
export class PaymentsTerminalModule {}
