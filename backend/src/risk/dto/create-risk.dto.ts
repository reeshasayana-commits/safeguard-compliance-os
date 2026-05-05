// ============================================================================
// CreateRiskDto — class-validator DTO mirroring the frontend Zod schema
// ============================================================================
//
// Every constraint here EXACTLY mirrors the Zod schema in:
//   frontend/src/schemas/risk.schema.ts
//
// This ensures that any request that passes frontend validation will also
// pass backend validation, and vice versa — no schema drift.
// ============================================================================

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { RiskSeverity } from '../../common/enums';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateRiskDto {
  /**
   * Short title of the risk.
   * Zod: z.string().min(5).max(120)
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(120, { message: 'Title must not exceed 120 characters' })
  title: string;

  /**
   * Detailed description of the risk, its cause, and potential impact.
   * Zod: z.string().min(10).max(500)
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;

  /**
   * Severity classification.
   * Zod: z.nativeEnum(RiskSeverity)
   */
  @IsEnum(RiskSeverity, { message: 'Please select a severity level' })
  severity: RiskSeverity;

  /**
   * UUID of the leaf-level location (area/floor).
   * Zod: z.string().min(1) — frontend uses the areaId field
   */
  @IsUUID('4', { message: 'Location must be a valid UUID' })
  @IsNotEmpty({ message: 'Please select a location' })
  locationId: string;

  /**
   * UUID of the assigned owner.
   * Zod: z.string().min(1)
   */
  @IsString()
  @IsNotEmpty({ message: 'Please assign an owner' })
  assignedUserId: string;

  /**
   * Mitigation / action plan.
   * Zod: z.string().min(20).max(2000)
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Action plan must be at least 20 characters' })
  @MaxLength(2000, { message: 'Action plan must not exceed 2000 characters' })
  actionPlan: string;

  /**
   * Optional due date for remediation — must be in the future if provided.
   * Zod: z.string().optional().refine(val => new Date(val) > new Date())
   */
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsFutureDate({ message: 'Due date must be in the future' })
  dueDate?: string;

  /**
   * Optional UUID of the audit that discovered this risk.
   * Not present in the frontend form — set by the API when linking.
   */
  @IsOptional()
  @IsUUID('4', { message: 'Audit ID must be a valid UUID' })
  auditId?: string;

  /**
   * Optional evidence URL.
   * Not validated on the frontend — upload happens separately.
   */
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  evidenceUrl?: string;
}
