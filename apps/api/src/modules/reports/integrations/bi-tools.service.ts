import { Injectable, Logger } from '@nestjs/common';

/** Placeholder — Looker / PowerBI connectors */
@Injectable()
export class BiToolsService {
  private readonly logger = new Logger(BiToolsService.name);

  publishDataset(tenantId: string, datasetName: string): void {
    this.logger.debug(
      `[placeholder] BiToolsService.publish tenant=${tenantId} dataset=${datasetName}`,
    );
  }
}
