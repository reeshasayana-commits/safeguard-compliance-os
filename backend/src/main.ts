// ============================================================================
// SafeGuard Backend — Bootstrap
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow large payloads for base64 image uploads
  app.use(json({ limit: '20mb' }));

  // ── Global Validation Pipe ──────────────────────────────────────────
  // Ensures ALL incoming DTOs are validated by class-validator.
  // whitelist: strips unknown properties
  // forbidNonWhitelisted: throws if unknown properties are present
  // transform: auto-transforms payloads to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────
  // Allow the Vite frontend dev server and Vercel production
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── API Prefix ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Start ───────────────────────────────────────────────────────────
  const config = app.get(ConfigService);
  // Render provides 'PORT' automatically. We check that first, then APP_PORT, then fallback to 3001.
  const port = process.env.PORT || config.get<number>('APP_PORT', 3001);

  await app.listen(port);
  console.log(`\n🛡️  SafeGuard API is live and listening on port ${port}`);
  console.log(`🚀 Base Path: api/v1\n`);
}

bootstrap();
