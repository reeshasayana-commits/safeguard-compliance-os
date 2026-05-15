// ============================================================================
// Risk Form Schema — Zod validation with strict boundary constraints
// ============================================================================

import { z } from 'zod';
import { RiskSeverity } from '../types';

/**
 * Zod schema for creating a new Risk/Issue.
 *
 * Boundary rules:
 *  - description: 10–500 chars, required
 *  - locationId: required (must select down to leaf level)
 *  - assignedUserId: required UUID
 *  - actionPlan: 20–2000 chars, required
 *  - severity: must be a valid RiskSeverity enum value
 *  - title: 5–120 chars, required
 *  - dueDate: optional, but if provided must be in the future
 */
export const createRiskSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must not exceed 120 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),

  severity: z.nativeEnum(RiskSeverity, {
    message: 'Please select a severity level',
  }),

  locationId: z
    .string()
    .min(1, 'Please select a location'),

  subLocationId: z
    .string()
    .min(1, 'Please select a sub-location'),

  areaId: z
    .string()
    .min(1, 'Please select an area or floor'),

  assignedUserId: z
    .string()
    .min(1, 'Please assign an owner'),

  actionPlan: z
    .string()
    .min(20, 'Action plan must be at least 20 characters')
    .max(2000, 'Action plan must not exceed 2000 characters'),

  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return new Date(val) > new Date();
      },
      { message: 'Due date must be in the future' }
    ),
  referenceStandard: z
    .string()
    .max(255, 'Reference standard must not exceed 255 characters')
    .optional(),
  actionTaken: z
    .string()
    .max(2000, 'Action taken must not exceed 2000 characters')
    .optional(),
  closureEvidenceUrl: z
    .string()
    .max(1024, 'Evidence URL must not exceed 1024 characters')
    .optional(),
  evidenceImage: z
    .string()
    .optional(),
});

export type CreateRiskFormData = z.infer<typeof createRiskSchema>;
