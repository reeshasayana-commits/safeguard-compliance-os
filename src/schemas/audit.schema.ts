import { z } from 'zod';
import { AuditStatus } from '../types';

export const createAuditSchema = z.object({
  unitName: z
    .string()
    .min(3, 'Unit name must be at least 3 characters')
    .max(255, 'Unit name must not exceed 255 characters'),

  auditorName: z
    .string()
    .min(3, 'Auditor name must be at least 3 characters')
    .max(255, 'Auditor name must not exceed 255 characters'),

  scheduledDate: z
    .string()
    .min(1, 'Please select a scheduled date')
    .refine(
      (val) => {
        if (!val) return false;
        // Audit dates can be in the past or future depending on if it's already scheduled or completed.
        // We'll just ensure it's a valid date string.
        return !isNaN(new Date(val).getTime());
      },
      { message: 'Invalid date format' }
    ),

  locationId: z
    .string()
    .min(1, 'Please select a location'),

  subLocationId: z
    .string()
    .optional(),

  areaId: z
    .string()
    .min(1, 'Please select a specific area or zone'),
    
  status: z.nativeEnum(AuditStatus).optional(),

  notes: z
    .string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
});

export type CreateAuditFormData = z.infer<typeof createAuditSchema>;
