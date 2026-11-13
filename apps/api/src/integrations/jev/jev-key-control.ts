import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { chmod } from 'node:fs/promises';
import { createServer, type Server, type Socket } from 'node:net';
import { JevCredentials } from './jev-credentials.js';
import { jevBackendKeyAddress, jevKeyAddress, requirePrivateJevDirectory } from './jev-key-address.js';
import { JEV_KEY_CONTROL_TIMEOUT_MS, JEV_KEY_MESSAGE_BYTES, jevKeyCommandSchema, type JevKeyReply } from './jev-key-protocol.js';
import type { JevKeyCommand } from './jev-key-protocol.js';
import { restrictWindowsJevPipe } from './jev-key-windows.js';
import { fileURLToPath } from 'node:url';

/** Local IPC only; no HTTP/TCP endpoint, key getter, persistence, provider
 * validation, task wake/retry or spending reset. Trust boundary: same OS user.
 */
@Injectable()
export class JevKeyControl implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JevKeyControl.name);
  private server?: Server;
  private readonly clients = new Set<Socket>();
  private readonly startupClients = new Set<Socket>();
  private ready = false;
  private backend = false;
  constructor(private readonly credentials: JevCredentials) {}

  async onModuleInit() {
    if (this.server) return; // API bootstrap already acquired its singleton pipe.
    await this.start(jevKeyAddress(process.pid));
  }
  async startBackend() {
    if (this.server) throw new Error('Local control was already initialized.');
    this.backend = true;
    await this.start(jevBackendKeyAddress());
  }
  private async start(address: ReturnType<typeof jevKeyAddress>) {
    if (address.directory) await requirePrivateJevDirectory(address.directory, true);
    const server = createServer(socket => this.handle(socket));
    this.server = server;
    server.maxConnections = 4;
    server.on('error', () => {
      this.ready = false;
      this.credentials.onModuleDestroy();
      for (const client of this.clients) client.destroy();
      this.logger.error('Local Jev credential control is unavailable; credentials cleared.');
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const fail = () => reject(new Error('Cannot bind local Jev credential control. No socket is automatically removed.'));
        server.once('error', fail);
        server.listen({ path: address.path, exclusive: true, readableAll: false, writableAll: false }, () => { server.removeListener('error', fail); resolve(); });
      });
      if (address.directory) await chmod(address.path, 0o600);
      else await restrictWindowsJevPipe(address.path);
      for(const socket of this.startupClients)socket.destroy();
      this.startupClients.clear();
      this.ready = true;
      // CLI-only contexts must still exit; this listener is not a job/daemon.
      server.unref();
      const cli = fileURLToPath(new URL('./jev-key-cli.js', import.meta.url));
      this.logger.log(`RAM-only Jev key control ready for PID ${process.pid}; starts empty. Use node "${cli}" set${this.backend ? '' : ` --worker-pid ${process.pid}`}.`);
    } catch {
      await this.close();
      throw new Error('Local control socket/pipe is occupied, stale or unavailable. Another backend may be running. Startup refused; no socket was removed.');
    }
  }
  private handle(socket: Socket) {
    // Windows ACL setup briefly connects before ready; no commands are read or
    // accepted until the pipe has owner-only access. Credentials are still empty.
    if (!this.ready) { socket.pause(); this.startupClients.add(socket); socket.once('close',()=>this.startupClients.delete(socket)); return; }
    this.clients.add(socket);
    let chunks: Buffer[] = [], length = 0, handled = false;
    const timer = setTimeout(() => socket.destroy(), JEV_KEY_CONTROL_TIMEOUT_MS);
    socket.once('close', () => { clearTimeout(timer); chunks = []; this.clients.delete(socket); });
    socket.on('error', () => {}); // Never log parser errors or input bytes.
    const reply = (value: JevKeyReply) => { handled = true; chunks = []; socket.end(`${JSON.stringify(value)}\n`); };
    socket.on('data', (chunk: Buffer) => {
      if(!this.ready){socket.destroy();return;}
      if (handled) return;
      length += chunk.length;
      if (length > JEV_KEY_MESSAGE_BYTES) { socket.destroy(); return; }
      chunks.push(chunk);
      if (!chunk.includes(10)) return;
      const body = Buffer.concat(chunks);
      chunks = [];
      const newline = body.indexOf(10);
      if (newline !== body.length - 1) { reply({ ok: false, error: 'invalid_command' }); return; }
      // JSON/schema exceptions can contain input values. Do not expose them.
      let command: JevKeyCommand;
      try { command = jevKeyCommandSchema.parse(JSON.parse(body.subarray(0, newline).toString('utf8'))); }
      catch { body.fill(0); reply({ ok: false, error: 'invalid_command' }); return; }
      body.fill(0);
      if (command.op === 'status') { reply({ ok: true, ...this.credentials.status() }); return; }
      try {
        const status = this.credentials.update(command.instanceId, command.expectedRevision, command.op === 'set' ? command.key : null);
        reply({ ok: true, ...status });
      } catch { reply({ ok: false, error: 'state_changed' }); }
    });
  }
  private async close() {
    this.ready = false;
    this.credentials.onModuleDestroy();
    for (const client of this.clients) client.destroy();
    for (const client of this.startupClients) client.destroy();
    if (this.server?.listening) await new Promise<void>(resolve => this.server!.close(() => resolve()));
  }
  onModuleDestroy() { return this.close(); }
}
