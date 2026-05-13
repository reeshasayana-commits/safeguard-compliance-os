import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  getHello(): { message: string; version: string } {
    return {
      message: 'Welcome to the SafeGuard API',
      version: 'v1',
    };
  }

  @Get('health')
  async checkHealth() {
    try {
      // Perform a simple query to keep the DB connection alive
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'error',
        database: 'disconnected',
        error: err.message,
      };
    }
  }
}
