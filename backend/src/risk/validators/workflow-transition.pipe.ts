// ============================================================================
// WorkflowTransitionPipe — Enforces strict status transition rules
// ============================================================================
//
// This pipe intercepts PATCH requests to update a Risk's status.
// It loads the current risk from the database, validates that the
// requested transition is legal per the state machine, and throws
// a BadRequestException if the transition is invalid.
//
// State Machine:
//   OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → APPROVED → CLOSED
//
// Legacy mappings:
//   IN_REVIEW → RESOLVED
//   MITIGATED → CLOSED
//
// CLOSED is a terminal state — no further transitions allowed.
// ============================================================================

import {
  PipeTransform,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk } from '../entities/risk.entity';
import { RiskStatus } from '../../common/enums';

/**
 * Valid workflow transitions.
 * Each key maps to an array of allowed target statuses.
 * An empty array means the state is terminal.
 */
const VALID_TRANSITIONS: Record<RiskStatus, RiskStatus[]> = {
  [RiskStatus.OPEN]:        [RiskStatus.ASSIGNED],
  [RiskStatus.ASSIGNED]:    [RiskStatus.IN_PROGRESS],
  [RiskStatus.IN_PROGRESS]: [RiskStatus.RESOLVED],
  [RiskStatus.IN_REVIEW]:   [RiskStatus.RESOLVED],
  [RiskStatus.RESOLVED]:    [RiskStatus.APPROVED],
  [RiskStatus.APPROVED]:    [RiskStatus.CLOSED],
  [RiskStatus.MITIGATED]:   [RiskStatus.CLOSED],
  [RiskStatus.CLOSED]:      [], // Terminal state
};

/**
 * Shape of the data flowing through this pipe.
 * The pipe expects the body to contain `status` and the route to contain `id`.
 */
export interface WorkflowTransitionContext {
  riskId: string;
  targetStatus: RiskStatus;
}

@Injectable()
export class WorkflowTransitionPipe implements PipeTransform<WorkflowTransitionContext> {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
  ) {}

  async transform(value: WorkflowTransitionContext): Promise<WorkflowTransitionContext> {
    const { riskId, targetStatus } = value;

    // ── 1. Load current risk ────────────────────────────────────────────
    const risk = await this.riskRepository.findOne({ where: { id: riskId } });

    if (!risk) {
      throw new NotFoundException(`Risk with ID "${riskId}" not found`);
    }

    // ── 2. Check if current status is terminal ─────────────────────────
    const currentStatus = risk.status;
    const allowedTargets = VALID_TRANSITIONS[currentStatus];

    if (!allowedTargets || allowedTargets.length === 0) {
      throw new BadRequestException(
        `Risk "${risk.riskId}" is in terminal state "${currentStatus}" — no further transitions allowed`,
      );
    }

    // ── 3. Validate the specific transition ────────────────────────────
    if (!allowedTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid workflow transition: "${currentStatus}" → "${targetStatus}". ` +
        `Allowed transitions from "${currentStatus}": [${allowedTargets.join(', ')}]`,
      );
    }

    return value;
  }
}

/**
 * Exported mapping for use in service layer / tests.
 */
export { VALID_TRANSITIONS };
