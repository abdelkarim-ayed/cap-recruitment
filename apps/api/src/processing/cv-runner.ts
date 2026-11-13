import { Inject, Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { FIXTURE_REGISTRY, type FixtureRegistry } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { ProcessingWake } from './processing-wake.js';
import { processingSettings } from './settings.js';

@Injectable()
export class CvBackgroundRunner implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CvBackgroundRunner.name);
  private timer?: ReturnType<typeof setTimeout>;
  private running?: Promise<void>;
  private readonly stop = new AbortController();
  private mode = 'disabled';
  private liveSince?: string;
  constructor(private readonly service: ProcessingService, private readonly repository: ProcessingRepository,
    private readonly wake: ProcessingWake, @Inject(FIXTURE_REGISTRY) private readonly fixtures: FixtureRegistry) {}
  async onModuleInit() {
    const config = processingSettings(); this.mode = config.runner; this.liveSince = config.liveSince;
    if (this.mode === 'disabled') return;
    if (this.mode === 'fixture') {
      const records = this.fixtures.load(JSON.parse(await readFile(config.fixtureFile!, 'utf8')));
      await this.repository.bind(records);
    }
    this.wake.listen(() => this.schedule(0));
    this.logger.log(`${this.mode}: post-submit wake + 5s DB scan; one application/request at a time; ${this.mode === 'jev' ? `real Jev for synthetic submissions since ${this.liveSince}; key required; unchanged spending limits` : 'no live provider'}.`);
    this.schedule(0);
  }
  private schedule(delay = 5000) {
    if (this.stop.signal.aborted || this.running) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.running = this.drain().catch(() => {
        // Repository outage/lease loss must not kill the API or rapid-loop.
        // Persisted eligibility and send guards decide the next scan's work.
        this.logger.warn('Processing interrupted; deferred to next DB scan (no blind provider retry).');
      }).finally(() => { this.running = undefined; this.schedule(); });
    }, delay);
    this.timer.unref();
  }
  private async drain() {
    if (this.mode === 'jev' && !this.service.isExecutorReady()) return; // No claims while key-empty.
    for (let count = 0; count < 10 && !this.stop.signal.aborted; count++) {
      const id = this.wake.take();
      const worked = await this.service.processOne(id, this.stop.signal, this.mode === 'fixture', this.mode === 'offline-demo' ? 30 : 43200, this.liveSince);
      if (!worked && !id) break;
      // Yield between applications; never hold up HTTP intake or run in parallel.
      await new Promise<void>(resolve => setImmediate(resolve));
    }
  }
  async onModuleDestroy() { this.stop.abort(); this.wake.listen(); clearTimeout(this.timer); await this.running; }
}
