import { create } from 'zustand';
import { type Audit, AuditStatus, UserRole } from '../types';
import { type CreateAuditFormData } from '../schemas/audit.schema';
import { apiClient } from '../api/client';
import { MOCK_AUDITS } from '../data/mock-data';

interface AuditStoreState {
  audits: Audit[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isSlideOverOpen: boolean;
  isLiveApi: boolean;
}

interface AuditStoreActions {
  fetchAudits: () => Promise<void>;
  createAudit: (data: CreateAuditFormData) => Promise<void>;
  openSlideOver: () => void;
  closeSlideOver: () => void;
  clearError: () => void;
}

type AuditStore = AuditStoreState & AuditStoreActions;

function mapApiAudit(r: Record<string, unknown>): Audit {
  const raw = r as Record<string, any>;
  return {
    id: raw.id,
    auditId: raw.auditId,
    locationId: raw.locationId,
    location: raw.location ?? {
      id: raw.locationId,
      name: raw.locationId,
      type: 'AREA',
      parentId: null,
      children: [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    },
    auditorId: `usr-${raw.auditorName.toLowerCase().replace(/\s+/g, '-')}`,
    auditor: {
      id: `usr-${raw.auditorName.toLowerCase().replace(/\s+/g, '-')}`,
      email: '',
      firstName: raw.auditorName.split(' ')[0] || '',
      lastName: raw.auditorName.split(' ').slice(1).join(' ') || '',
      fullName: raw.auditorName,
      role: UserRole.AUDITOR,
      department: '',
      isActive: true,
      lastLoginAt: null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    },
    scheduledDate: raw.auditDate,
    completedDate: raw.completedDate ?? null,
    status: raw.status,
    score: raw.score ?? null,
    findings: [],
    notes: raw.notes ?? '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    // Add unitName to match frontend extensions if necessary
    ...(raw.unitName && { unitName: raw.unitName }),
  };
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  audits: [],
  isLoading: false,
  isMutating: false,
  error: null,
  isSlideOverOpen: false,
  isLiveApi: false,

  fetchAudits: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/audits');
      const mapped = (response.data as Record<string, unknown>[]).map(mapApiAudit);
      set({ audits: mapped, isLoading: false, isLiveApi: true });
    } catch {
      console.warn('[AuditStore] API unavailable — falling back to mock data');
      set({ audits: [...MOCK_AUDITS], isLoading: false, isLiveApi: false });
    }
  },

  createAudit: async (data: CreateAuditFormData) => {
    set({ isMutating: true, error: null });
    try {
      if (get().isLiveApi) {
        const payload = {
          unitName: data.unitName,
          auditorName: data.auditorName,
          auditDate: data.scheduledDate,
          locationId: data.areaId,
          status: data.status || AuditStatus.SCHEDULED,
          notes: data.notes,
        };
        await apiClient.post('/audits', payload);
        await get().fetchAudits();
      } else {
        // Mock fallback
        const newAudit: Audit = {
          id: `a-${Date.now()}`,
          auditId: `AUD-2025-${String(get().audits.length + 43).padStart(4, '0')}`,
          locationId: data.areaId,
          location: {
            id: data.areaId, name: data.areaId, type: 'ZONE', parentId: data.subLocationId || null,
            children: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          },
          auditorId: `usr-mock`,
          auditor: {
            id: `usr-mock`, email: '', firstName: '', lastName: '',
            fullName: data.auditorName, role: UserRole.AUDITOR, department: '',
            isActive: true, lastLoginAt: null, createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          scheduledDate: data.scheduledDate,
          completedDate: null,
          status: data.status || AuditStatus.SCHEDULED,
          score: null,
          findings: [],
          notes: data.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(data.unitName && { unitName: data.unitName } as any),
        };
        set((s) => ({ audits: [newAudit, ...s.audits] }));
      }
      set({ isMutating: false, isSlideOverOpen: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create audit';
      set({ error: Array.isArray(msg) ? msg.join(', ') : msg, isMutating: false });
      throw err; // Re-throw to handle toast in the UI component
    }
  },

  openSlideOver: () => set({ isSlideOverOpen: true }),
  closeSlideOver: () => set({ isSlideOverOpen: false }),
  clearError: () => set({ error: null }),
}));
