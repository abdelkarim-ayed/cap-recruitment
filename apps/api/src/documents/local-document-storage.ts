import { constants } from 'node:fs';
import { chmod, mkdir, open, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { uploadLimits } from '@recruitment/domain/applications';
import type { DocumentStorage } from './document-storage.js';

const reference = /^local-file:([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/;
export class LocalDocumentStorage implements DocumentStorage {
  constructor(private readonly directory: string) {}
  private path(storageRef: string) {
    const id = reference.exec(storageRef)?.[1];
    if (!id) throw new Error('Invalid internal storage reference.');
    return join(this.directory, id);
  }
  async put(bytes: Buffer) {
    if (!bytes.length || bytes.length > uploadLimits.fileBytes) throw new Error('Invalid object size.');
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await chmod(this.directory, 0o700);
    const storageRef = `local-file:${randomUUID()}`, target = this.path(storageRef), temporary = `${target}.part`;
    try {
      const file = await open(temporary, 'wx', 0o600);
      try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
      await rename(temporary, target);
      return storageRef;
    } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
  }
  async read(storageRef: string) {
    const file = await open(this.path(storageRef), constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const info = await file.stat();
      if (!info.isFile() || info.size <= 0 || info.size > uploadLimits.fileBytes) throw new Error('Invalid stored object.');
      const bytes = await file.readFile();
      if (bytes.length > uploadLimits.fileBytes) throw new Error('Stored object exceeds operational limit.');
      return bytes;
    } finally { await file.close(); }
  }
  async remove(storageRef: string) { await unlink(this.path(storageRef)).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}
