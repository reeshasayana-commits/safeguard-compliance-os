// ============================================================================
// Risk Entity — Risk register entry with workflow status + relations
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RiskSeverity, RiskStatus } from '../../common/enums';
import { Location } from '../../location/entities/location.entity';
import { Audit } from '../../audit/entities/audit.entity';

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable sequential ID, e.g. "RSK-2025-0107" */
  @Column({ type: 'varchar', length: 20, unique: true })
  riskId: string;

  /** Short title of the risk */
  @Column({ type: 'varchar', length: 120 })
  title: string;

  /** Detailed description of the risk, its cause, and potential impact */
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'enum', enum: RiskSeverity })
  severity: RiskSeverity;

  /** Workflow status — transitions enforced by WorkflowTransitionPipe */
  @Column({ type: 'enum', enum: RiskStatus, default: RiskStatus.OPEN })
  status: RiskStatus;

  /** UUID of the assigned user (owner) */
  @Column({ type: 'varchar', length: 255 })
  assignedUserId: string;

  /** Mitigation / action plan */
  @Column({ type: 'varchar', length: 2000 })
  actionPlan: string;

  /** Optional due date for remediation */
  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  /** Base64-encoded evidence image or URL */
  @Column({ type: 'mediumtext', nullable: true })
  evidenceUrl: string | null;

  /** Reference standard (e.g. ISO 45001, OSHA) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceStandard: string | null;

  /** Narrative of actions taken during resolution */
  @Column({ type: 'varchar', length: 2000, nullable: true })
  actionTaken: string | null;

  /** URL to evidence of closure (image/document) */
  @Column({ type: 'mediumtext', nullable: true })
  closureEvidenceUrl: string | null;

  /** JSON array of activity log strings */
  @Column({ type: 'simple-json', nullable: true })
  activityLogs: string[] | null;

  // ── Relations ────────────────────────────────────────────────────────

  /**
   * @ManyToOne Location — RESTRICT
   * Prevents deleting a Location that still has associated Risks.
   * The operator must reassign or delete risks first.
   */
  @ManyToOne(() => Location, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid' })
  locationId: string;

  /**
   * @ManyToOne Audit — SET NULL
   * A risk may optionally be linked to the audit that discovered it.
   * If that audit is deleted, the risk survives with auditId = null.
   */
  @ManyToOne(() => Audit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'auditId' })
  audit: Audit | null;

  @Column({ type: 'uuid', nullable: true })
  auditId: string | null;

  // ── Timestamps ───────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
