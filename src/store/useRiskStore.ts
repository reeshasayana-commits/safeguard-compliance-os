// ============================================================================
// Risk Store — Zustand state management with live API integration
// ============================================================================

import { create } from 'zustand';
import { RiskSeverity, RiskStatus, UserRole } from '../types/index';
import type { Risk } from '../types/index';
import { type CreateRiskFormData } from '../schemas/risk.schema';
import { apiClient } from '../api/client';
import { MOCK_RISKS } from '../data/mock-data';

// ---------------------------------------------------------------------------
// Filter Types
// ---------------------------------------------------------------------------

export interface RiskFilters {
  search: string;
  status: RiskStatus | '';
  severity: RiskSeverity | '';
  locationId: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: RiskFilters = {
  search: '',
  status: '',
  severity: '',
  locationId: '',
  dateFrom: '',
  dateTo: '',
};

// ---------------------------------------------------------------------------
// Workflow State Machine — strict transitions
// ---------------------------------------------------------------------------

export const WORKFLOW_TRANSITIONS: Record<RiskStatus, { nextStatus: RiskStatus; label: string } | null> = {
  [RiskStatus.OPEN]:        { nextStatus: RiskStatus.ASSIGNED,    label: 'Assign' },
  [RiskStatus.ASSIGNED]:    { nextStatus: RiskStatus.IN_PROGRESS, label: 'Start Work' },
  [RiskStatus.IN_PROGRESS]: { nextStatus: RiskStatus.RESOLVED,    label: 'Mark Resolved' },
  [RiskStatus.IN_REVIEW]:   { nextStatus: RiskStatus.RESOLVED,    label: 'Mark Resolved' }, // Fallback for legacy state
  [RiskStatus.RESOLVED]:    { nextStatus: RiskStatus.APPROVED,    label: 'Approve' },
  [RiskStatus.APPROVED]:    { nextStatus: RiskStatus.CLOSED,      label: 'Close Risk' },
  [RiskStatus.MITIGATED]:   { nextStatus: RiskStatus.CLOSED,      label: 'Close Risk' }, // Fallback for legacy state
  [RiskStatus.CLOSED]:      null, // Terminal state
};

// ---------------------------------------------------------------------------
// Store Types
// ---------------------------------------------------------------------------

interface RiskStoreState {
  risks: Risk[];
  filters: RiskFilters;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isSlideOverOpen: boolean;
  selectedRisk: Risk | null;
  /** Tracks whether we're using live API or mock fallback */
  isLiveApi: boolean;
  /** Live dashboard statistics */
  stats: {
    totalRisks: number;
    openRisks: number;
    inReview: number;
    mitigated: number;
    closed: number;
    complianceScore: number;
    byLocation: Array<{ name: string; count: number }>;
    byAssignee: Array<{ name: string; count: number }>;
  };
}

interface RiskStoreActions {
  fetchRisks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createRisk: (data: CreateRiskFormData) => Promise<void>;
  updateRisk: (id: string, data: Partial<Risk>) => Promise<void>;
  updateRiskStatus: (id: string, status: RiskStatus) => Promise<void>;
  advanceWorkflow: (id: string, extraPayload?: Partial<Risk>) => Promise<void>;
  setFilters: (partial: Partial<RiskFilters>) => void;
  resetFilters: () => void;
  openSlideOver: () => void;
  closeSlideOver: () => void;
  selectRisk: (risk: Risk | null) => void;
  /** Internal: Recalculate stats from current risks array (used in mock mode) */
  _recalculateMockStats: () => void;
  clearError: () => void;
}

type RiskStore = RiskStoreState & RiskStoreActions;

// ---------------------------------------------------------------------------
// Filtering logic — pure function
// ---------------------------------------------------------------------------

function applyFilters(risks: Risk[], filters: RiskFilters): Risk[] {
  return risks.filter((risk) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = `${risk.title} ${risk.description} ${risk.riskId}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.status && risk.status !== filters.status) return false;
    if (filters.severity && risk.severity !== filters.severity) return false;
    if (filters.locationId) {
      const locMatch =
        risk.locationId === filters.locationId ||
        risk.location.name.toLowerCase().includes(filters.locationId.toLowerCase());
      if (!locMatch) return false;
    }
    if (filters.dateFrom) {
      const updated = risk.updatedAt ?? risk.lastUpdated;
      if (new Date(updated) < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      const updated = risk.updatedAt ?? risk.lastUpdated;
      if (new Date(updated) > to) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// API response → frontend Risk mapper
// ---------------------------------------------------------------------------

function mapApiRisk(r: Record<string, unknown>): Risk {
  const raw = r as Record<string, any>;
  return {
    id: raw.id,
    riskId: raw.riskId,
    title: raw.title,
    description: raw.description,
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
    severity: raw.severity,
    status: raw.status,
    ownerId: raw.assignedUserId,
    owner: {
      id: raw.assignedUserId,
      email: '',
      firstName: '',
      lastName: '',
      fullName: raw.assignedUserId?.replace('usr-', '').replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? 'Unassigned',
      role: UserRole.AUDITOR,
      department: '',
      isActive: true,
      lastLoginAt: null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    },
    mitigationPlan: raw.actionPlan ?? '',
    dueDate: raw.dueDate ?? null,
    evidenceUrl: raw.evidenceUrl ?? undefined,
    actionTaken: raw.actionTaken ?? undefined,
    closureEvidenceUrl: raw.closureEvidenceUrl ?? undefined,
    activityLogs: raw.activityLogs ?? undefined,
    referenceStandard: raw.referenceStandard ?? undefined,
    lastUpdated: raw.updatedAt ?? raw.createdAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRiskStore = create<RiskStore>((set, get) => ({
  risks: [],
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,
  isMutating: false,
  error: null,
  isSlideOverOpen: false,
  selectedRisk: null,
  isLiveApi: false,
  stats: {
    totalRisks: 0,
    openRisks: 0,
    inReview: 0,
    mitigated: 0,
    closed: 0,
    complianceScore: 100,
    byLocation: [],
    byAssignee: [],
  },

  fetchRisks: async () => {
    set({ isLoading: true, error: null });
    try {
      // Attempt live API first
      const response = await apiClient.get('/risks');
      const mapped = (response.data as Record<string, unknown>[]).map(mapApiRisk);
      set({ risks: mapped, isLoading: false, isLiveApi: true });
      
      // Immediately refresh stats from the server
      await get().fetchStats();
    } catch (err) {
      // Fallback to mock data if backend is not running
      console.warn('[RiskStore] API unavailable or failed — falling back to mock data', err);
      const mockRisks = [...get().risks.length > 0 ? get().risks : MOCK_RISKS];
      
      set({ 
        risks: mockRisks, 
        isLoading: false, 
        isLiveApi: false 
      });
      get()._recalculateMockStats();
    }
  },

  fetchStats: async () => {
    try {
      if (get().isLiveApi) {
        const response = await apiClient.get('/risks/stats');
        set({ stats: response.data });
      } else {
        get()._recalculateMockStats();
      }
    } catch (err) {
      console.error('[RiskStore] Failed to fetch stats:', err);
    }
  },

  _recalculateMockStats: () => {
    const { risks } = get();
    const totalRisks = risks.length;
    const openRisks = risks.filter(r => r.status === RiskStatus.OPEN || r.status === RiskStatus.ASSIGNED).length;
    const inReview = risks.filter(r => r.status === RiskStatus.IN_REVIEW).length;
    const mitigated = risks.filter(r => r.status === RiskStatus.MITIGATED || r.status === RiskStatus.APPROVED).length;
    const closed = risks.filter((r) => r.status === RiskStatus.CLOSED).length;
    const complianceScore = totalRisks > 0 ? Math.round(((totalRisks - openRisks) / totalRisks) * 100) : 100;

    // By Location
    const locationMap: Record<string, number> = {};
    risks.forEach(r => {
      const name = r.location?.name || 'Unknown';
      locationMap[name] = (locationMap[name] || 0) + 1;
    });
    const byLocation = Object.entries(locationMap).map(([name, count]) => ({ name, count }));

    // By Assignee
    const assigneeMap: Record<string, number> = {};
    risks.forEach(r => {
      const name = r.assignedUserId || 'Unassigned';
      assigneeMap[name] = (assigneeMap[name] || 0) + 1;
    });
    const byAssignee = Object.entries(assigneeMap).map(([name, count]) => ({ name, count }));

    set({
      stats: {
        totalRisks,
        openRisks,
        inReview,
        mitigated,
        closed,
        complianceScore,
        byLocation,
        byAssignee,
      },
    });
  },

  createRisk: async (data: CreateRiskFormData) => {
    set({ isMutating: true, error: null });
    console.log('[RiskStore] Creating risk with payload:', data);
    
    try {
      if (get().isLiveApi) {
        const payload = {
          title: data.title,
          description: data.description,
          severity: data.severity,
          locationId: data.areaId,
          assignedUserId: data.assignedUserId,
          actionPlan: data.actionPlan,
          dueDate: data.dueDate || undefined,
          evidenceUrl: data.evidenceImage || undefined,
          referenceStandard: data.referenceStandard || undefined,
        };
        const response = await apiClient.post('/risks', payload);
        console.log('[RiskStore] Risk created successfully:', response.data);
        
        // Refetch everything to ensure synchronization
        await get().fetchRisks();
        await get().fetchStats();
      } else {
        // Mock fallback
        const newRisk: Risk = {
          id: `r-${Date.now()}`,
          riskId: `RSK-2025-${String(get().risks.length + 108).padStart(4, '0')}`,
          title: data.title,
          description: data.description,
          locationId: data.areaId,
          location: {
            id: data.areaId, name: 'New Location', type: 'AREA' as any, parentId: data.subLocationId,
            children: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          },
          severity: data.severity,
          status: RiskStatus.OPEN,
          ownerId: data.assignedUserId,
          owner: {
            id: data.assignedUserId, email: '', firstName: '', lastName: '',
            fullName: data.assignedUserId, role: UserRole.AUDITOR, department: '',
            isActive: true, lastLoginAt: null, createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          mitigationPlan: data.actionPlan,
          dueDate: data.dueDate ?? null,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ risks: [newRisk, ...s.risks] }));
      }
      set({ isMutating: false, isSlideOverOpen: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create risk';
      set({ error: Array.isArray(msg) ? msg.join(', ') : msg, isMutating: false });
    }
  },

  updateRisk: async (id: string, data: Partial<Risk>) => {
    set({ isMutating: true, error: null });
    try {
      if (get().isLiveApi) {
        // Map frontend fields to backend DTO
        const payload: any = { ...data };
        if (data.locationId) payload.locationId = data.locationId;
        
        await apiClient.patch(`/risks/${id}`, payload);
        await get().fetchRisks();
      } else {
        // Mock update
        set((state) => ({
          risks: state.risks.map((r) => (r.id === id ? { ...r, ...data } : r)),
          selectedRisk: state.selectedRisk?.id === id ? { ...state.selectedRisk, ...data } : state.selectedRisk,
        }));
      }
      set({ isMutating: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to update risk';
      set({ error: Array.isArray(msg) ? msg.join(', ') : msg, isMutating: false });
    }
  },

  updateRiskStatus: async (id: string, status: RiskStatus) => {
    set({ isMutating: true, error: null });
    try {
      if (get().isLiveApi) {
        await apiClient.patch(`/risks/${id}/status`, { status });
        // Update local state optimistically
        set((state) => {
          const now = new Date().toISOString();
          const updatedRisks = state.risks.map((r) =>
            r.id === id ? { ...r, status, updatedAt: now, lastUpdated: now } : r
          );
          const updatedSelected = state.selectedRisk?.id === id
            ? { ...state.selectedRisk, status, updatedAt: now, lastUpdated: now }
            : state.selectedRisk;
          return { risks: updatedRisks, selectedRisk: updatedSelected, isMutating: false };
        });
      } else {
        // Mock fallback
        set((state) => {
          const now = new Date().toISOString();
          const updatedRisks = state.risks.map((r) =>
            r.id === id ? { ...r, status, updatedAt: now, lastUpdated: now } : r
          );
          const updatedSelected = state.selectedRisk?.id === id
            ? { ...state.selectedRisk, status, updatedAt: now, lastUpdated: now }
            : state.selectedRisk;
          return { risks: updatedRisks, selectedRisk: updatedSelected, isMutating: false };
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to update status';
      set({ error: Array.isArray(msg) ? msg.join(', ') : msg, isMutating: false });
    }
  },

  advanceWorkflow: async (id: string, extraPayload?: Partial<Risk>) => {
    const risk = get().risks.find((r) => r.id === id);
    if (!risk) return;
    const transition = WORKFLOW_TRANSITIONS[risk.status];
    if (!transition) return;
    
    // Use updateRisk to allow sending extra payload like activityLogs
    await get().updateRisk(id, { 
      status: transition.nextStatus,
      ...extraPayload 
    });
  },

  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  openSlideOver: () => set({ isSlideOverOpen: true }),
  closeSlideOver: () => set({ isSlideOverOpen: false }),
  selectRisk: (risk) => set({ selectedRisk: risk }),
  clearError: () => set({ error: null }),
}));

// ---------------------------------------------------------------------------
// Selector: filtered risks
// ---------------------------------------------------------------------------

export function useFilteredRisks(): Risk[] {
  const risks = useRiskStore((s) => s.risks);
  const filters = useRiskStore((s) => s.filters);
  return applyFilters(risks, filters);
}
