import { Injectable, Logger } from '@nestjs/common';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';

@Injectable()
export class DriverTrackingService {
  private readonly logger = new Logger(DriverTrackingService.name);

  start(task: DeliveryTaskEntity): void {
    this.logger.debug(`[placeholder] driver tracking start task=${task.id}`);
  }

  stop(task: DeliveryTaskEntity): void {
    this.logger.debug(`[placeholder] driver tracking stop task=${task.id}`);
  }
}
