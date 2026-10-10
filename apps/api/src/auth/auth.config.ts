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
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128, requireEmailVerification: true, autoSignIn: false, revokeSessionsOnPasswordReset: true },
    emailVerification: { sendOnSignUp: true, autoSignInAfterVerification: false },
    session: { expiresIn: 60 * 60 * 24 * 7, disableSessionRefresh: true, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 100, customRules: { '/sign-in/email': { window:60, max:10 } } },
    hooks: { before: createAuthMiddleware(async context => {
      if (context.path === '/email-otp/send-verification-otp' && !['sign-in', 'email-verification', 'forget-password'].includes(context.body?.type)) {
        throw new APIError('BAD_REQUEST', { code: 'UNSUPPORTED_OTP_TYPE', message: 'Unsupported verification type.' });
      }
    }) },
    plugins: [emailOTP({
      storeOTP: 'hashed', expiresIn: 300, allowedAttempts: 3, overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const purpose = type === 'sign-in' ? 'sign-in' : type === 'email-verification' ? 'email verification' : 'password reset';
        await mail.send({
          to: email,
          subject: `Your recruitment ${purpose} code`,
          text: `Your ${purpose} code is ${otp}. It expires in 5 minutes. If you did not request it, ignore this email.`,
        });
      },
    })],
  });
}
