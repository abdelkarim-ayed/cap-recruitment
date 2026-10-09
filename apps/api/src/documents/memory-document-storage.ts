import { randomUUID } from 'node:crypto';
import type { DocumentStorage } from './document-storage.js';

// Test override only, not an environment-selectable production driver.
export class MemoryDocumentStorage implements DocumentStorage {
  readonly objects = new Map<string, Buffer>();
  async put(bytes: Buffer) { const ref = `memory-file:${randomUUID()}`; this.objects.set(ref, Buffer.from(bytes)); return ref; }
  async read(ref: string) { const bytes = this.objects.get(ref); if (!bytes) throw new Error('Missing fixture object.'); return Buffer.from(bytes); }
  async remove(ref: string) { this.objects.delete(ref); }
}
