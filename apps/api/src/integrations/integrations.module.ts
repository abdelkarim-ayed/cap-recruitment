import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { MAIL_SENDER } from './mail/mail-sender.js';
import { FileMailSender } from './mail/file-mail-sender.js';
import { SmtpMailSender } from './mail/smtp-mail-sender.js';
import { EXTRACTION_PROVIDER } from './extraction/extraction-provider.js';
import { demoExtractionFixtures, DisabledExtractionProvider, FixtureExtractionProvider } from './extraction/fixture-extraction-provider.js';

@Module({
  imports: [ConfigurationModule],
  providers: [
    { provide: MAIL_SENDER, inject: [RUNTIME_CONFIG], useFactory: (settings: RuntimeConfig) => settings.mail.driver === 'file' ? new FileMailSender(settings.mail.outboxDirectory) : new SmtpMailSender(settings.mail) },
    { provide: EXTRACTION_PROVIDER, inject: [RUNTIME_CONFIG], useFactory: (settings: RuntimeConfig) => settings.extractionDriver === 'fixture' ? new FixtureExtractionProvider(demoExtractionFixtures) : new DisabledExtractionProvider() },
  ],
  exports: [MAIL_SENDER, EXTRACTION_PROVIDER],
})
export class IntegrationsModule {}
