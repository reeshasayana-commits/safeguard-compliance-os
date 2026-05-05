import {
  type DashboardStats,
  type RisksByStatus,
  type ActivityItem,
  type Audit,
  type Risk,
  AuditStatus,
  RiskSeverity,
  RiskStatus,
  UserRole,
} from '../types';

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalRisks: 247,
  openRisks: 38,
  pendingAudits: 12,
  complianceScore: 94.2,
  totalRisksTrend: 2,
  openRisksTrend: -5,
  pendingAuditsTrend: 1,
  complianceScoreTrend: 0.4,
};

export const MOCK_RISKS_BY_STATUS: RisksByStatus = {
  open: 38,
  inReview: 45,
  mitigated: 120,
  closed: 44,
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'audit_completed',
    title: 'Safety Audit Completed',
    description: 'Site B — Building 3, Floor 2 scored 96%',
    timestamp: '2025-05-05T10:30:00Z',
    userId: 'u1',
    user: { id: 'u1', fullName: 'Ananya Sharma', avatarUrl: undefined },
  },
  {
    id: 'act-2',
    type: 'risk_review',
    title: 'Risk Review Pending',
    description: 'Chemical storage ventilation — awaiting manager sign-off',
    timestamp: '2025-05-05T09:15:00Z',
    userId: 'u2',
    user: { id: 'u2', fullName: 'Raj Patel', avatarUrl: undefined },
  },
  {
    id: 'act-3',
    type: 'risk_detected',
    title: 'Critical Risk Detected',
    description: 'Electrical panel exposure — Zone C warehouse',
    timestamp: '2025-05-05T08:45:00Z',
    userId: 'u3',
    user: { id: 'u3', fullName: 'System Alert', avatarUrl: undefined },
  },
  {
    id: 'act-4',
    type: 'policy_updated',
    title: 'Policy Updated',
    description: 'Fire evacuation procedure v3.2 published',
    timestamp: '2025-05-04T16:00:00Z',
    userId: 'u1',
    user: { id: 'u1', fullName: 'Ananya Sharma', avatarUrl: undefined },
  },
  {
    id: 'act-5',
    type: 'audit_scheduled',
    title: 'New Audit Scheduled',
    description: 'Quarterly safety review — Main Plant, May 20',
    timestamp: '2025-05-04T14:30:00Z',
    userId: 'u4',
    user: { id: 'u4', fullName: 'Priya Nair', avatarUrl: undefined },
  },
];

// ---------------------------------------------------------------------------
// Audits
// ---------------------------------------------------------------------------

const baseUser = {
  id: 'u1',
  email: 'ananya@safeguard.io',
  firstName: 'Ananya',
  lastName: 'Sharma',
  fullName: 'Ananya Sharma',
  role: UserRole.AUDITOR,
  department: 'Safety',
  isActive: true,
  lastLoginAt: '2025-05-05T10:00:00Z',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2025-05-05T10:00:00Z',
};

const baseLocation = {
  id: 'loc-1',
  name: 'Main Plant',
  type: 'SITE' as const,
  parentId: null,
  children: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const MOCK_AUDITS: Audit[] = [
  {
    id: 'a1', auditId: 'AUD-2025-0042', locationId: 'loc-1', location: { ...baseLocation, name: 'Main Plant — Bldg A' },
    auditorId: 'u1', auditor: baseUser, scheduledDate: '2025-05-01', completedDate: '2025-05-01', status: AuditStatus.COMPLETED,
    score: 96, findings: [], notes: '', createdAt: '2025-04-20T00:00:00Z', updatedAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'a2', auditId: 'AUD-2025-0041', locationId: 'loc-2', location: { ...baseLocation, id: 'loc-2', name: 'Warehouse C' },
    auditorId: 'u2', auditor: { ...baseUser, id: 'u2', fullName: 'Raj Patel', firstName: 'Raj', lastName: 'Patel' },
    scheduledDate: '2025-05-03', completedDate: null, status: AuditStatus.IN_PROGRESS,
    score: null, findings: [], notes: '', createdAt: '2025-04-22T00:00:00Z', updatedAt: '2025-05-03T00:00:00Z',
  },
  {
    id: 'a3', auditId: 'AUD-2025-0040', locationId: 'loc-3', location: { ...baseLocation, id: 'loc-3', name: 'Lab Building 2' },
    auditorId: 'u1', auditor: baseUser, scheduledDate: '2025-05-10', completedDate: null, status: AuditStatus.SCHEDULED,
    score: null, findings: [], notes: '', createdAt: '2025-04-25T00:00:00Z', updatedAt: '2025-04-25T00:00:00Z',
  },
  {
    id: 'a4', auditId: 'AUD-2025-0039', locationId: 'loc-1', location: { ...baseLocation, name: 'Main Plant — Bldg B' },
    auditorId: 'u4', auditor: { ...baseUser, id: 'u4', fullName: 'Priya Nair', firstName: 'Priya', lastName: 'Nair' },
    scheduledDate: '2025-04-28', completedDate: '2025-04-28', status: AuditStatus.COMPLETED,
    score: 89, findings: [], notes: '', createdAt: '2025-04-15T00:00:00Z', updatedAt: '2025-04-28T00:00:00Z',
  },
  {
    id: 'a5', auditId: 'AUD-2025-0038', locationId: 'loc-4', location: { ...baseLocation, id: 'loc-4', name: 'Storage Facility' },
    auditorId: 'u2', auditor: { ...baseUser, id: 'u2', fullName: 'Raj Patel', firstName: 'Raj', lastName: 'Patel' },
    scheduledDate: '2025-04-25', completedDate: '2025-04-25', status: AuditStatus.FAILED,
    score: 42, findings: [], notes: '', createdAt: '2025-04-10T00:00:00Z', updatedAt: '2025-04-25T00:00:00Z',
  },
  {
    id: 'a6', auditId: 'AUD-2025-0037', locationId: 'loc-5', location: { ...baseLocation, id: 'loc-5', name: 'Admin Block' },
    auditorId: 'u1', auditor: baseUser, scheduledDate: '2025-05-15', completedDate: null, status: AuditStatus.SCHEDULED,
    score: null, findings: [], notes: '', createdAt: '2025-05-02T00:00:00Z', updatedAt: '2025-05-02T00:00:00Z',
  },
  {
    id: 'a7', auditId: 'AUD-2025-0036', locationId: 'loc-1', location: { ...baseLocation, name: 'Main Plant — Bldg C' },
    auditorId: 'u4', auditor: { ...baseUser, id: 'u4', fullName: 'Priya Nair', firstName: 'Priya', lastName: 'Nair' },
    scheduledDate: '2025-04-20', completedDate: '2025-04-20', status: AuditStatus.COMPLETED,
    score: 92, findings: [], notes: '', createdAt: '2025-04-05T00:00:00Z', updatedAt: '2025-04-20T00:00:00Z',
  },
  {
    id: 'a8', auditId: 'AUD-2025-0035', locationId: 'loc-6', location: { ...baseLocation, id: 'loc-6', name: 'Loading Dock' },
    auditorId: 'u2', auditor: { ...baseUser, id: 'u2', fullName: 'Raj Patel', firstName: 'Raj', lastName: 'Patel' },
    scheduledDate: '2025-05-08', completedDate: null, status: AuditStatus.IN_PROGRESS,
    score: null, findings: [], notes: '', createdAt: '2025-05-01T00:00:00Z', updatedAt: '2025-05-05T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Risks
// ---------------------------------------------------------------------------

export const MOCK_RISKS: Risk[] = [
  {
    id: 'r1', riskId: 'RSK-2025-0107', title: 'Electrical panel exposure', description: '', locationId: 'loc-3',
    location: { ...baseLocation, id: 'loc-3', name: 'Warehouse C — Zone A' }, severity: RiskSeverity.CRITICAL,
    status: RiskStatus.OPEN, ownerId: 'u1', owner: baseUser, mitigationPlan: '', dueDate: '2025-05-10',
    lastUpdated: '2025-05-05T08:45:00Z', createdAt: '2025-05-04T00:00:00Z', updatedAt: '2025-05-05T08:45:00Z',
  },
  {
    id: 'r2', riskId: 'RSK-2025-0106', title: 'Chemical storage ventilation failure', description: '', locationId: 'loc-4',
    location: { ...baseLocation, id: 'loc-4', name: 'Lab Building 2' }, severity: RiskSeverity.HIGH,
    status: RiskStatus.IN_REVIEW, ownerId: 'u2', owner: { ...baseUser, id: 'u2', fullName: 'Raj Patel' }, mitigationPlan: '',
    dueDate: '2025-05-12', lastUpdated: '2025-05-04T14:00:00Z', createdAt: '2025-05-03T00:00:00Z', updatedAt: '2025-05-04T14:00:00Z',
  },
  {
    id: 'r3', riskId: 'RSK-2025-0105', title: 'Fire exit blocked — North wing', description: '', locationId: 'loc-1',
    location: { ...baseLocation, name: 'Main Plant — Bldg A' }, severity: RiskSeverity.HIGH,
    status: RiskStatus.MITIGATED, ownerId: 'u4', owner: { ...baseUser, id: 'u4', fullName: 'Priya Nair' }, mitigationPlan: '',
    dueDate: null, lastUpdated: '2025-05-02T00:00:00Z', createdAt: '2025-04-28T00:00:00Z', updatedAt: '2025-05-02T00:00:00Z',
  },
  {
    id: 'r4', riskId: 'RSK-2025-0104', title: 'Scaffolding inspection overdue', description: '', locationId: 'loc-2',
    location: { ...baseLocation, id: 'loc-2', name: 'Construction Site D' }, severity: RiskSeverity.MEDIUM,
    status: RiskStatus.OPEN, ownerId: 'u1', owner: baseUser, mitigationPlan: '', dueDate: '2025-05-08',
    lastUpdated: '2025-05-01T00:00:00Z', createdAt: '2025-04-30T00:00:00Z', updatedAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'r5', riskId: 'RSK-2025-0103', title: 'PPE non-compliance in welding bay', description: '', locationId: 'loc-1',
    location: { ...baseLocation, name: 'Main Plant — Welding Bay' }, severity: RiskSeverity.MEDIUM,
    status: RiskStatus.IN_REVIEW, ownerId: 'u2', owner: { ...baseUser, id: 'u2', fullName: 'Raj Patel' }, mitigationPlan: '',
    dueDate: '2025-05-15', lastUpdated: '2025-04-29T00:00:00Z', createdAt: '2025-04-27T00:00:00Z', updatedAt: '2025-04-29T00:00:00Z',
  },
  {
    id: 'r6', riskId: 'RSK-2025-0102', title: 'Ergonomic workstation assessment needed', description: '', locationId: 'loc-5',
    location: { ...baseLocation, id: 'loc-5', name: 'Admin Block' }, severity: RiskSeverity.LOW,
    status: RiskStatus.OPEN, ownerId: 'u4', owner: { ...baseUser, id: 'u4', fullName: 'Priya Nair' }, mitigationPlan: '',
    dueDate: '2025-05-20', lastUpdated: '2025-04-28T00:00:00Z', createdAt: '2025-04-25T00:00:00Z', updatedAt: '2025-04-28T00:00:00Z',
  },
  {
    id: 'r7', riskId: 'RSK-2025-0101', title: 'Gas leak detector calibration expired', description: '', locationId: 'loc-4',
    location: { ...baseLocation, id: 'loc-4', name: 'Lab Building 2' }, severity: RiskSeverity.CRITICAL,
    status: RiskStatus.MITIGATED, ownerId: 'u1', owner: baseUser, mitigationPlan: '', dueDate: null,
    lastUpdated: '2025-04-30T00:00:00Z', createdAt: '2025-04-20T00:00:00Z', updatedAt: '2025-04-30T00:00:00Z',
  },
  {
    id: 'r8', riskId: 'RSK-2025-0100', title: 'Slip hazard in cafeteria entrance', description: '', locationId: 'loc-1',
    location: { ...baseLocation, name: 'Main Plant — Cafeteria' }, severity: RiskSeverity.LOW,
    status: RiskStatus.CLOSED, ownerId: 'u2', owner: { ...baseUser, id: 'u2', fullName: 'Raj Patel' }, mitigationPlan: '',
    dueDate: null, lastUpdated: '2025-04-22T00:00:00Z', createdAt: '2025-04-10T00:00:00Z', updatedAt: '2025-04-22T00:00:00Z',
  },
];
