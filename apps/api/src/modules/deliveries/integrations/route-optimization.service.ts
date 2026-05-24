import { Injectable, Logger } from '@nestjs/common';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';

@Injectable()
export class RouteOptimizationService {
  private readonly logger = new Logger(RouteOptimizationService.name);

  optimize(task: DeliveryTaskEntity): void {
    this.logger.debug(`[placeholder] route optimization task=${task.id}`);
  }
}
