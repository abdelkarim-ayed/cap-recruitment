import { ok } from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module.js';
import { configureApplication } from '../dist/bootstrap.js';
import { MAIL_SENDER } from '../dist/integrations/mail/mail-sender.js';
import { MemoryMailSender } from '../dist/integrations/mail/memory-mail-sender.js';
import { runAuthScenario } from './auth-scenario.mjs';
import { RUNTIME_CONFIG, readRuntimeConfig } from '../dist/configuration/runtime-config.js';

// Real authentication and PostgreSQL; no SMTP/Mailpit/external account needed.
const mail = new MemoryMailSender();
const module = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(RUNTIME_CONFIG).useValue(readRuntimeConfig({ ...process.env, MAIL_DRIVER: 'file' }))
  .overrideProvider(MAIL_SENDER).useValue(mail).compile();
const app = configureApplication(module.createNestApplication({ bodyParser: false, logger: false }));
await runAuthScenario(app, {
  label: 'memory mail fixture, real PostgreSQL',
  async readText(email) {
    const message = mail.messages.findLast(item => item.to === email);
    ok(message, 'In-memory OTP email was not captured');
    return message.text;
  },
  async cleanup() { mail.messages.length = 0; },
});
