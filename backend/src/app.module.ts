// ============================================================================
// AppModule — Root module wiring DB, config, and all feature modules
// ============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { LocationModule } from './location/location.module';
import { AuditModule } from './audit/audit.module';
import { RiskModule } from './risk/risk.module';
import { DatabaseModule } from './database/database.module';

// Entity imports for TypeORM forRootAsync
import { Location } from './location/entities/location.entity';
import { Audit } from './audit/entities/audit.entity';
import { Risk } from './risk/entities/risk.entity';
import { ActivityLog } from './common/entities/activity-log.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── TypeORM ─────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'safeguard'),
        entities: [Location, Audit, Risk, ActivityLog],
        synchronize: config.get<string>('TYPEORM_SYNC', 'false') === 'true',
        logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
        ssl: config.get<string>('DB_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        extra: {
          connectionLimit: 10,
        },
      }),
    }),

    // ── Feature Modules ──────────────────────────────────────────────────
    CommonModule,      // Global interceptor (ActivityLogger)
    LocationModule,
    AuditModule,
    RiskModule,
    DatabaseModule,    // Seeder
  ],
  controllers: [AppController],
})
export class AppModule {}
