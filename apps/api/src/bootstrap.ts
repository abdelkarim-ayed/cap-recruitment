import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { setResponse } from 'better-call/node';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { AuthService } from './auth/auth.service.js';
import type { INestApplication } from '@nestjs/common';
import { RUNTIME_CONFIG, type RuntimeConfig } from './configuration/runtime-config.js';
import { JevKeyControl } from './integrations/jev/jev-key-control.js';

export async function createApplication(logger: false | undefined = undefined) {
  let app: INestApplication | undefined;
  try {
    app = await NestFactory.create(AppModule, { abortOnError: false, bodyParser: false, ...(logger === false ? { logger: false } : {}) });
    // One shared backend control socket, acquired before any module lifecycle
    // hooks can start a worker. Occupied/stale address fails closed, never stolen.
    await app.get(JevKeyControl).startBackend();
    return configureApplication(app);
  } catch (error) {
    await app?.close();
    throw error;
  }
}

// Shared by production bootstrap and Nest test modules with adapter overrides.
export function configureApplication(app: INestApplication) {
  const settings = app.get<RuntimeConfig>(RUNTIME_CONFIG);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: settings.webOrigin, credentials: true });
  // Never trust a user-supplied IP header. Proxy trust can be configured later.
  app.use((request: Request, _response: Response, next: NextFunction) => {
    request.headers['x-recruitment-client-ip'] = request.socket.remoteAddress ?? '';
    next();
  });
  const auth = app.get(AuthService).auth;
  app.getHttpAdapter().getInstance().all('/api/auth/*splat',
    express.raw({ type: () => true, limit: '32kb', inflate: false }),
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const webRequest = new globalThis.Request(new URL(request.originalUrl, settings.authUrl), {
          method: request.method, headers: fromNodeHeaders(request.headers),
          ...(request.method !== 'GET' && request.method !== 'HEAD' && Buffer.isBuffer(request.body) ? { body: new Uint8Array(request.body) } : {}),
        });
        await setResponse(response, await auth.handler(webRequest));
      } catch (error) { next(error); }
    });
  // Only the bounded bulk confirmation needs space for 1,000 optional reasons.
  app.use('/api/vacancies/:id/screening/apply',express.json({limit:'10mb',inflate:false}));
  app.use(express.json({ limit: '256kb' }));
  app.use((error: { type?: string }, _request: Request, response: Response, next: NextFunction) => {
    if (error.type === 'entity.too.large') {
      response.status(413).json({ code: 'BODY_TOO_LARGE', message: 'Request body is too large.' });
    } else next(error);
  });
  app.enableShutdownHooks();
  return app;
}
