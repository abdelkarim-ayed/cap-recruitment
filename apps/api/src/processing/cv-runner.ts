import { Inject, Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { FIXTURE_REGISTRY, type FixtureRegistry } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { processingSettings } from './settings.js';

// One non-overlapping background invocation per API process. DB claims arbitrate
// multiple processes. Defaults disabled; only explicitly trusted fixture work is
// supported here. No startup live drain, framework queue or question jobs.
@Injectable()
export class CvBackgroundRunner implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setTimeout>;
  private running?: Promise<void>;
  private readonly stop = new AbortController();
  constructor(private readonly service: ProcessingService, private readonly repository: ProcessingRepository, @Inject(FIXTURE_REGISTRY) private readonly fixtures: FixtureRegistry) {}
  async onModuleInit() {
    const config = processingSettings();
    if (config.runner !== 'fixture') return;
    const records = this.fixtures.load(JSON.parse(await readFile(config.fixtureFile!, 'utf8')));
    await this.repository.bind(records);
    this.schedule();
  }
  private schedule() {
    if (this.stop.signal.aborted) return;
    this.timer = setTimeout(() => {
      this.running = this.service.processOne(undefined, this.stop.signal, true).then(() => {}, () => {
        // Fail closed on repository/configuration errors: no rapid repeated
        // claims. Original task state remains inspectable/recoverable by policy.
        this.stop.abort();
      }).finally(() => { this.running = undefined; this.schedule(); });
    }, 1000);
    this.timer.unref();
  }
  async onModuleDestroy() { this.stop.abort(); clearTimeout(this.timer); await this.running; }
}
