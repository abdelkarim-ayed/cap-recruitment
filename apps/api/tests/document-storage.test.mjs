import { test } from 'node:test';
import { deepEqual, equal, rejects } from 'node:assert/strict';
import { mkdtemp, stat, readdir, rm, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalDocumentStorage } from '../dist/documents/local-document-storage.js';
import { MemoryDocumentStorage } from '../dist/documents/memory-document-storage.js';

test('private local storage roundtrips bytes, restricts permissions/references and cleans owned files', async () => {
  const directory = await mkdtemp(join(existsSync('/tmp/opencode') ? '/tmp/opencode' : tmpdir(), 'document-test-'));
  try {
    const storage = new LocalDocumentStorage(directory), bytes = Buffer.from('UNTRUSTED FIXTURE');
    const ref = await storage.put(bytes);
    deepEqual(await storage.read(ref), bytes);
    equal((await stat(directory)).mode & 0o777, 0o700);
    const filename = ref.slice('local-file:'.length);
    equal((await stat(join(directory, filename))).mode & 0o777, 0o600);
    await rejects(storage.read('local-file:../../etc/passwd'));
    await rejects(storage.put(Buffer.alloc(0)));
    const linkRef = 'local-file:11111111-1111-4111-8111-111111111111';
    await symlink(join(directory, filename), join(directory, linkRef.slice('local-file:'.length)));
    await rejects(storage.read(linkRef));
    await storage.remove(ref); await storage.remove(ref); await storage.remove(linkRef);
    deepEqual(await readdir(directory), []);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('memory storage fixture does not share caller-owned buffers', async () => {
  const storage = new MemoryDocumentStorage(), bytes = Buffer.from('fixture');
  const ref = await storage.put(bytes); bytes.fill(0);
  const read = await storage.read(ref); read.fill(0);
  equal((await storage.read(ref)).toString(), 'fixture');
  await storage.remove(ref); await rejects(storage.read(ref));
});
