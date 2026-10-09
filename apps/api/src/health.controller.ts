import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { applicationStages } from '@recruitment/domain';
import { DatabaseService } from './database/database.service.js';
import { REDIS_PROBE, type ConnectivityProbe } from './infrastructure/connectivity.js';
import { Public } from './auth/access.js';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly database: DatabaseService, @Inject(REDIS_PROBE) private readonly redis: ConnectivityProbe) {}
  @Get()
  live() { return { status: 'ok', service: 'recruitment-api', applicationStages }; }

  @Get('ready')
  async ready() {
    const results = await Promise.allSettled([this.database.check(), this.redis.check()]);
    const status = {
      database: results[0].status === 'fulfilled' ? 'ok' : 'unavailable',
      redis: results[1].status === 'fulfilled' ? 'ok' : 'unavailable',
    };
    if (results.some(result => result.status === 'rejected')) throw new ServiceUnavailableException(status);
    return { status: 'ready', ...status };
  }
}
