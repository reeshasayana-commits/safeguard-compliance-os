// ============================================================================
// RiskController — REST endpoints for the Risk register
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RiskService } from './risk.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskStatusDto } from './dto/update-risk-status.dto';
import { Risk } from './entities/risk.entity';

@Controller('risks')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  /**
   * GET /risks
   * Fetch all risks with related entities.
   */
  @Get()
  async findAll(): Promise<Risk[]> {
    return this.riskService.findAll();
  }

  /**
   * GET /risks/:id
   * Fetch a single risk by ID.
   */
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Risk> {
    return this.riskService.findOne(id);
  }

  /**
   * POST /risks
   * Create a new risk. Body is validated by class-validator via CreateRiskDto.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRiskDto): Promise<Risk> {
    return this.riskService.create(dto);
  }

  /**
   * PATCH /risks/:id/status
   * Advance a risk's workflow status.
   *
   * The WorkflowTransitionPipe is called inside the service layer
   * (defense-in-depth) rather than as a route-level pipe, because it
   * needs to load the risk entity from the database to compare current
   * vs. target status.
   *
   * The DTO validation (class-validator) ensures `status` is a valid enum.
   * The service validates the transition is legal per the state machine.
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRiskStatusDto,
  ): Promise<Risk> {
    return this.riskService.updateStatus(id, dto.status);
  }

  /**
   * DELETE /risks/:id
   * Remove a risk from the register.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.riskService.remove(id);
  }
}
