// ============================================================================
// CommonModule — Global interceptors, shared entities, utility providers
// ============================================================================

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLoggerInterceptor } from './interceptors/activity-logger.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggerInterceptor,
    },
  ],
  exports: [TypeOrmModule],
})
export class CommonModule {}
