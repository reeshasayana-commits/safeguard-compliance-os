// ============================================================================
// DatabaseModule — Houses the SeederService
// ============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Location } from '../location/entities/location.entity';
import { Risk } from '../risk/entities/risk.entity';
import { Audit } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Risk, Audit])],
  providers: [SeederService],
})
export class DatabaseModule {}
