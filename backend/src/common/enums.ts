// ============================================================================
// SafeGuard — Shared Enums (Single source of truth for the backend domain)
// ============================================================================

/**
 * Hierarchical location type within the site tree.
 *   LOCATION      → Top-level site (e.g., "Warehouse Complex")
 *   SUB_LOCATION  → Building / zone within a site
 *   AREA          → Floor / dock / specific area
 */
export enum LocationType {
  LOCATION = 'LOCATION',
  SUB_LOCATION = 'SUB_LOCATION',
  AREA = 'AREA',
}

/**
 * Risk severity classification.
 * Mirrors the frontend `RiskSeverity` enum in `src/types/index.ts`.
 */
export enum RiskSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

/**
 * Strict workflow state machine for risk lifecycle.
 * Transitions are enforced by `WorkflowTransitionPipe`.
 *
 *   OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → APPROVED → CLOSED
 *
 * Legacy statuses (IN_REVIEW, MITIGATED) are retained for backward compat.
 */
export enum RiskStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  APPROVED = 'APPROVED',
  MITIGATED = 'MITIGATED',
  CLOSED = 'CLOSED',
}

/**
 * Audit status lifecycle.
 */
export enum AuditStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
