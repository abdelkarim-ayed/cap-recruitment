import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import type { Pool } from 'pg';
import type { RuntimeConfig } from '../configuration/runtime-config.js';
import type { MailSender } from '../integrations/mail/mail-sender.js';

export function createAuth(database: Pool, mail: MailSender, settings: RuntimeConfig) {
  return betterAuth({
    appName: 'Recruitment', database, secret: settings.authSecret,
    baseURL: settings.authUrl,
    trustedOrigins: [settings.webOrigin],
    advanced: { ipAddress: { ipAddressHeaders: ['x-recruitment-client-ip'] } },
    user: { additionalFields: { role: { type: 'string', required: true, defaultValue: 'candidate', input: false } } },
    session: { expiresIn: 60 * 60 * 24 * 7, disableSessionRefresh: true, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 100 },
    hooks: { before: createAuthMiddleware(async context => {
      if (context.path === '/email-otp/send-verification-otp' && context.body?.type !== 'sign-in') {
        throw new APIError('BAD_REQUEST', { code: 'UNSUPPORTED_OTP_TYPE', message: 'Only sign-in codes are supported.' });
      }
    }) },
    plugins: [emailOTP({
      storeOTP: 'hashed', expiresIn: 300, allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== 'sign-in') return;
        await mail.send({
          to: email,
          subject: 'Your recruitment sign-in code',
          text: `Your sign-in code is ${otp}. It expires in 5 minutes. If you did not request it, ignore this email.`,
        });
      },
    })],
  });
}
