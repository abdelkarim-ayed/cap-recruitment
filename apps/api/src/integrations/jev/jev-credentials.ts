import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { validJevKey } from './jev-key-value.js';

export interface JevCredentialStatus { instanceId: string; revision: number; configured: boolean }

/** Empty on every process start, with no environment/file fallback. JS strings
 * cannot promise secure erasure; no key/fingerprint appears in public status.
 * Only the gateway captures a key; local control can replace/clear, never read.
 */
@Injectable()
export class JevCredentials implements OnModuleDestroy {
  #key: string | undefined;
  #revision = 0;
  #waiters = new Set<(available:boolean)=>void>();
  readonly instanceId = randomUUID();

  status(): JevCredentialStatus { return { instanceId: this.instanceId, revision: this.#revision, configured: this.#key !== undefined }; }
  captureForGateway(): string | undefined { return this.#key; }
  waitUntilConfigured(signal:AbortSignal):Promise<void> {
    if(signal.aborted)return Promise.reject(new Error('Credential wait cancelled.'));
    if(this.#key!==undefined)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const finish=(available:boolean)=>{
        this.#waiters.delete(finish);signal.removeEventListener('abort',abort);
        if(available)resolve();else reject(new Error('Credential wait cancelled or control unavailable.'));
      };
      const abort=()=>finish(false);
      this.#waiters.add(finish);signal.addEventListener('abort',abort,{once:true});
      if(signal.aborted)abort();
    });
  }
  update(instanceId: string, expectedRevision: number, key: string | null): JevCredentialStatus {
    if (instanceId !== this.instanceId || expectedRevision !== this.#revision) throw new Error('Credential state changed; inspect status and retry deliberately.');
    if (key !== null && !validJevKey(key)) throw new Error('Invalid credential input.');
    this.#key = key ?? undefined;
    this.#revision++;
    if(this.#key!==undefined)for(const waiter of [...this.#waiters])waiter(true);
    return this.status();
  }
  onModuleDestroy() { this.#key = undefined;for(const waiter of [...this.#waiters])waiter(false); }
}
