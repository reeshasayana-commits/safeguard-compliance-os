// ============================================================================
// Audit Entity — Safety audit record linked to a Location
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
import { AuditStatus } from '../../common/enums';
import { Location } from '../../location/entities/location.entity';

@Entity('audits')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable sequential ID, e.g. "AUD-2025-0042" */
  @Column({ type: 'varchar', length: 20, unique: true })
  auditId: string;

  /** Name of the organizational unit being audited */
  @Column({ type: 'varchar', length: 255 })
  unitName: string;

  /** Name of the auditor conducting the audit */
  @Column({ type: 'varchar', length: 255 })
  auditorName: string;

  /** Scheduled date of the audit */
  @Column({ type: 'date' })
  auditDate: Date;

  /** Date the audit was actually completed */
  @Column({ type: 'date', nullable: true })
  completedDate: Date | null;

  @Column({ type: 'enum', enum: AuditStatus, default: AuditStatus.SCHEDULED })
  status: AuditStatus;

  /** Compliance score: 0–100 */
  @Column({ type: 'int', nullable: true })
  score: number | null;

  /** Free-text notes / observations */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // ── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Location, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid' })
  locationId: string;

  // ── Timestamps ───────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
