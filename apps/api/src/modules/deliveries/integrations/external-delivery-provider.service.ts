import { Injectable, Logger } from '@nestjs/common';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';

@Injectable()
export class ExternalDeliveryProviderService {
  private readonly logger = new Logger(ExternalDeliveryProviderService.name);

  notifyTaskCreated(task: DeliveryTaskEntity): void {
    this.logger.debug(
      `[placeholder] external providers (UberDirect/Stuart/DoorDashDrive) task=${task.id}`,
    );
  }
}
