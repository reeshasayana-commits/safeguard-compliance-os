// ============================================================================
// RiskService — CRUD + workflow operations for the Risk entity
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk } from './entities/risk.entity';
import { CreateRiskDto } from './dto/create-risk.dto';
import { RiskStatus } from '../common/enums';
import { VALID_TRANSITIONS } from './validators/workflow-transition.pipe';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
  ) {}

  /**
   * Fetch all risks with related Location and Audit eagerly loaded.
   */
  async findAll(): Promise<Risk[]> {
    return this.riskRepository.find({
      relations: ['location', 'audit'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Fetch a single risk by primary key.
   */
  async findOne(id: string): Promise<Risk> {
    const risk = await this.riskRepository.findOne({
      where: { id },
      relations: ['location', 'audit'],
    });
    if (!risk) {
      throw new NotFoundException(`Risk with ID "${id}" not found`);
    }
    return risk;
  }

  /**
   * Create a new risk from a validated DTO.
   * Generates a sequential human-readable riskId.
   */
  async create(dto: CreateRiskDto): Promise<Risk> {
    const count = await this.riskRepository.count();
    const riskId = `RSK-${new Date().getFullYear()}-${String(count + 100).padStart(4, '0')}`;

    const risk = this.riskRepository.create({
      ...dto,
      riskId,
      status: RiskStatus.OPEN,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });

    return this.riskRepository.save(risk);
  }

  /**
   * Advance a risk's workflow status.
   * The WorkflowTransitionPipe has already validated the transition is legal
   * before this method is called.
   */
  async updateStatus(id: string, targetStatus: RiskStatus): Promise<Risk> {
    const risk = await this.findOne(id);

    // Double-check: defensive validation (pipe already checked, but defense-in-depth)
    const allowedTargets = VALID_TRANSITIONS[risk.status];
    if (!allowedTargets?.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid transition: "${risk.status}" → "${targetStatus}"`,
      );
    }

    risk.status = targetStatus;
    return this.riskRepository.save(risk);
  }

  /**
   * Update a risk's details.
   */
  async update(id: string, dto: any): Promise<Risk> {
    const risk = await this.findOne(id);
    
    // Handle date conversion if present
    if (dto.dueDate) {
      dto.dueDate = new Date(dto.dueDate);
    }

    // Merge updates
    Object.assign(risk, dto);
    
    return this.riskRepository.save(risk);
  }

  /**
   * Calculate dashboard statistics.
   */
  async getStats(): Promise<any> {
    const totalRisks = await this.riskRepository.count();
    
    // Count by status
    const statusCounts = await this.riskRepository
      .createQueryBuilder('risk')
      .select('risk.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('risk.status')
      .getRawMany();

    const stats = {
      totalRisks,
      openRisks: 0,
      inReview: 0,
      mitigated: 0,
      closed: 0,
      complianceScore: 100, // Default
    };

    statusCounts.forEach(c => {
      const statusStr = c.status as string;
      const count = parseInt(c.count);
      
      if (['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(statusStr)) {
        stats.openRisks += count;
      }
      if (statusStr === 'RESOLVED') {
        stats.inReview += count;
      }
      if (statusStr === 'APPROVED') {
        stats.mitigated += count;
      }
      if (statusStr === 'CLOSED') {
        stats.closed += count;
      }
    });

    // Simple compliance score: (Non-Open Risks / Total Risks) * 100
    if (totalRisks > 0) {
      stats.complianceScore = Math.round(((totalRisks - stats.openRisks) / totalRisks) * 100);
    }

    // Risks by Location
    const locationCounts = await this.riskRepository
      .createQueryBuilder('risk')
      .leftJoin('risk.location', 'location')
      .select('location.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('location.name')
      .getRawMany();

    // Risks by Assignee
    const assigneeCounts = await this.riskRepository
      .createQueryBuilder('risk')
      .select('risk.assignedUserId', 'assignee')
      .addSelect('COUNT(*)', 'count')
      .groupBy('risk.assignedUserId')
      .getRawMany();

    return {
      ...stats,
      byLocation: locationCounts.map(c => ({ name: c.name, count: parseInt(c.count) })),
      byAssignee: assigneeCounts.map(c => ({ name: c.assignee, count: parseInt(c.count) })),
    };
  }

  /**
   * Delete a risk by ID.
   */
  async remove(id: string): Promise<void> {
    const risk = await this.findOne(id);
    await this.riskRepository.remove(risk);
  }
}
