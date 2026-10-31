import { join } from 'node:path';
import { projectRoot } from './environment.js';

export interface RuntimeConfig {
  databaseUrl: string;
  redisUrl: string;
  authSecret: string;
  authUrl: string;
  webOrigin: string;
  mail: {
    driver: 'smtp' | 'file';
    from: string;
    outboxDirectory: string;
    smtp: { host: string; port: number; secure: boolean; auth?: { user: string; pass: string } };
  };
  extractionDriver: 'disabled' | 'fixture';
  documentDirectory: string;
}

export const RUNTIME_CONFIG = Symbol('RUNTIME_CONFIG');

export function readRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const authSecret = env.BETTER_AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) throw new Error('Set BETTER_AUTH_SECRET (at least 32 characters) in the project environment.');
  const driver = env.MAIL_DRIVER ?? 'smtp';
  if (driver !== 'smtp' && driver !== 'file') throw new Error('MAIL_DRIVER must be smtp or file.');
  const extractionDriver = env.EXTRACTION_DRIVER ?? 'disabled';
  if (extractionDriver !== 'disabled' && extractionDriver !== 'fixture') throw new Error('EXTRACTION_DRIVER must be disabled or fixture; no live provider is implemented.');
  if (env.NODE_ENV === 'production' && (driver === 'file' || extractionDriver === 'fixture')) {
    throw new Error('Development mail capture and extraction fixtures are forbidden in production.');
  }
  const smtp = driver === 'smtp' ? smtpSettings(env) : { host: '127.0.0.1', port: 51025, secure: false };
  return {
    databaseUrl: env.DATABASE_URL ?? 'postgresql://recruitment:recruitment_local@127.0.0.1:55437/recruitment',
    redisUrl: env.REDIS_URL ?? 'redis://127.0.0.1:56379',
    authSecret,
    authUrl: env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    mail: {
      driver, from: env.MAIL_FROM ?? 'Recruitment <recruitment@example.test>',
      outboxDirectory: join(projectRoot, '.local', 'mail-outbox'),
      smtp,
    },
    extractionDriver,
    documentDirectory: env.DOCUMENT_DIRECTORY ?? join(projectRoot, '.local', 'documents'),
  };
}

function smtpSettings(env: NodeJS.ProcessEnv): RuntimeConfig['mail']['smtp'] {
  const port = Number(env.SMTP_PORT ?? 51025);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SMTP_PORT must be an integer from 1 to 65535.');
  if (env.SMTP_SECURE !== undefined && !['true', 'false'].includes(env.SMTP_SECURE)) throw new Error('SMTP_SECURE must be true or false.');
  if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASSWORD)) throw new Error('Set both SMTP_USER and SMTP_PASSWORD, or neither.');
  return {
    host: env.SMTP_HOST ?? '127.0.0.1', port, secure: env.SMTP_SECURE === 'true',
    ...(env.SMTP_USER && env.SMTP_PASSWORD ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
  };
}
