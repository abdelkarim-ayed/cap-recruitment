import { Inject, Injectable } from '@nestjs/common';
import { createAuth } from './auth.config.js';
import { DatabaseService } from '../database/database.service.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { MAIL_SENDER, type MailSender } from '../integrations/mail/mail-sender.js';

@Injectable()
export class AuthService {
  readonly auth: ReturnType<typeof createAuth>;
  constructor(database: DatabaseService, @Inject(MAIL_SENDER) mail: MailSender, @Inject(RUNTIME_CONFIG) settings: RuntimeConfig) {
    this.auth = createAuth(database.pool, mail, settings);
  }
}
