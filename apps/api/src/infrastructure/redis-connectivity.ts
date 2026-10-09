import { createClient } from 'redis';
import type { ConnectivityProbe } from './connectivity.js';

// Connectivity only: this is not a queue, worker, or application cache API.
export class RedisConnectivityProbe implements ConnectivityProbe {
  constructor(private readonly url: string, private readonly timeoutMs = 3000) {}
  async check() {
    const client = createClient({ url: this.url, socket: { connectTimeout: this.timeoutMs, reconnectStrategy: false } });
    client.on('error', () => {});
    let timer: NodeJS.Timeout | undefined;
    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Redis connectivity check timed out.')), this.timeoutMs);
      timer.unref();
    });
    try {
      await Promise.race([deadline, (async () => {
        await client.connect();
        if (await client.ping() !== 'PONG') throw new Error('Unexpected Redis ping response.');
      })()]);
    } finally {
      clearTimeout(timer);
      if (client.isOpen) client.destroy();
    }
  }
}
