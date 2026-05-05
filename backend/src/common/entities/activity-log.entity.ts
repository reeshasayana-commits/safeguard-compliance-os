// ============================================================================
// ActivityLog Entity — Immutable audit trail for all mutating API operations
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Action types captured by the global interceptor.
 */
export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The HTTP method-derived action type */
  @Column({ type: 'enum', enum: ActivityAction })
  action: ActivityAction;

  /** The resource type affected, e.g., "Risk", "Location", "Audit" */
  @Column({ type: 'varchar', length: 100 })
  @Index()
  resourceName: string;

  /** The ID of the specific resource affected */
  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId: string | null;

  /** The user who performed the action (from JWT or session — placeholder for now) */
  @Column({ type: 'varchar', length: 255, default: 'system' })
  @Index()
  userId: string;

  /** Free-form JSON details: request body snapshot, old/new status, etc. */
  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown> | null;

  /** HTTP method used */
  @Column({ type: 'varchar', length: 10 })
  httpMethod: string;

  /** The full route path */
  @Column({ type: 'varchar', length: 500 })
  route: string;

  /** HTTP status code of the response */
  @Column({ type: 'int' })
  statusCode: number;

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
