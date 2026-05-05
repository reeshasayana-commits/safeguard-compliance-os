import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; version: string } {
    return {
      message: 'Welcome to the SafeGuard API',
      version: 'v1',
    };
  }
}
