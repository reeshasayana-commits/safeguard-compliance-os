// ============================================================================
// UpdateRiskStatusDto — Payload for workflow status transition
// ============================================================================

import { IsEnum } from 'class-validator';
import { RiskStatus } from '../../common/enums';

export class UpdateRiskStatusDto {
  /**
   * The target status to transition to.
   * The WorkflowTransitionPipe validates that this transition is legal
   * from the risk's current status.
   */
  @IsEnum(RiskStatus, { message: 'Status must be a valid RiskStatus value' })
  status: RiskStatus;
}
