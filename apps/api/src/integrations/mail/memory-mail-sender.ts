import type { MailMessage, MailSender } from './mail-sender.js';

// Test override only; never selected by runtime environment configuration.
export class MemoryMailSender implements MailSender {
  readonly messages: MailMessage[] = [];
  async send(message: MailMessage) { this.messages.push(structuredClone(message)); }
}
