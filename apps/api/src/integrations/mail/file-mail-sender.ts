import { createHash, randomUUID } from 'node:crypto';
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { MailMessage, MailSender } from './mail-sender.js';

export interface CapturedMail {
  delivery: 'development-capture';
  id: string;
  createdAt: string;
  message: MailMessage;
}

function mailboxPath(directory: string, email: string) {
  return join(directory, `${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}.json`);
}

export class FileMailSender implements MailSender {
  constructor(private readonly directory: string) {}
  async send(message: MailMessage) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await chmod(this.directory, 0o700);
    const id = randomUUID();
    const temporaryPath = join(this.directory, `${id}.tmp`);
    const captured: CapturedMail = { delivery: 'development-capture', id, createdAt: new Date().toISOString(), message };
    await writeFile(temporaryPath, JSON.stringify(captured), { flag: 'wx', mode: 0o600 });
    await rename(temporaryPath, mailboxPath(this.directory, message.to));
  }
}

export async function readCapturedMail(directory: string, email: string): Promise<CapturedMail> {
  return JSON.parse(await readFile(mailboxPath(directory, email), 'utf8')) as CapturedMail;
}
