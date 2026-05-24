import { Controller, Get } from '@nestjs/common';
import { Public } from '../../modules/auth';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  async readiness() {
    const data = await this.health.check();
    return { success: data.status !== 'down', data };
  }

  @Public()
  @Get('live')
  async liveness() {
    return { success: true, data: await this.health.liveness() };
  }
}
