import { createTransport, type Transporter } from 'nodemailer';
import type { OnModuleDestroy } from '@nestjs/common';
import type { RuntimeConfig } from '../../configuration/runtime-config.js';
import type { MailMessage, MailSender } from './mail-sender.js';

export class SmtpMailSender implements MailSender, OnModuleDestroy {
  private readonly transport: Transporter;
  constructor(private readonly settings: RuntimeConfig['mail']) {
    this.transport = createTransport({ ...settings.smtp, connectionTimeout: 5000, socketTimeout: 5000 });
  }
  async send(message: MailMessage) { await this.transport.sendMail({ from: this.settings.from, ...message }); }
  onModuleDestroy() { this.transport.close(); }
}
