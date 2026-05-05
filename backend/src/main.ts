// ============================================================================
// SafeGuard Backend — Bootstrap
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  // Allow the Vite frontend dev server
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── API Prefix ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Start ───────────────────────────────────────────────────────────
  const config = app.get(ConfigService);
  const port = config.get<number>('APP_PORT', 3001);

  await app.listen(port);
  console.log(`\n🛡️  SafeGuard API running at http://localhost:${port}/api/v1\n`);
}

bootstrap();
