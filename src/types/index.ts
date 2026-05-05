// ============================================================================
// SafeGuard — TypeScript Domain Model
// Strict interfaces matching NestJS backend contracts.
// ZERO `any` types. Fully typed. Production-ready.
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum RiskSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

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

export enum AuditStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

// ---------------------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------------------

/** Hierarchical location tree (Site > Building > Floor > Zone) */
export interface HierarchicalLocation {
  id: string;
  name: string;
  type: 'SITE' | 'BUILDING' | 'FLOOR' | 'ZONE';
  parentId: string | null;
  children: HierarchicalLocation[];
  address?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

/** Platform user */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  department: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Role definition with granular permissions */
export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: 'audits' | 'risks' | 'users' | 'settings' | 'reports';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

/** Safety audit record */
export interface Audit {
  id: string;
  auditId: string;           // Human-readable ID, e.g. "AUD-2025-0042"
  unitName?: string;         // Department or unit name
  locationId: string;
  location: HierarchicalLocation;
  auditorId: string;
  auditor: User;
  scheduledDate: string;
  completedDate: string | null;
  status: AuditStatus;
  score: number | null;       // 0–100 percentage
  findings: AuditFinding[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFinding {
  id: string;
  description: string;
  severity: RiskSeverity;
  resolved: boolean;
  resolvedAt: string | null;
}

/** Risk register entry */
export interface Risk {
  id: string;
  riskId: string;             // Human-readable ID, e.g. "RSK-2025-0107"
  title: string;
  description: string;
  locationId: string;
  location: HierarchicalLocation;
  severity: RiskSeverity;
  status: RiskStatus;
  ownerId: string;
  owner: User;
  mitigationPlan: string;
  dueDate: string | null;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalRisks: number;
  openRisks: number;
  pendingAudits: number;
  complianceScore: number;
  totalRisksTrend: number;
  openRisksTrend: number;
  pendingAuditsTrend: number;
  complianceScoreTrend: number;
}

export interface RisksByStatus {
  open: number;
  inReview: number;
  mitigated: number;
  closed: number;
}

export interface ActivityItem {
  id: string;
  type: 'audit_completed' | 'risk_detected' | 'risk_review' | 'policy_updated' | 'audit_scheduled';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  user: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
}
