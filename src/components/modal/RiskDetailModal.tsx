import { useEffect } from 'react';
import {
  X, AlertTriangle, MapPin, User, Calendar, Clock,
  FileText, ChevronRight, Loader2, Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge, resolveVariant } from '../ui/StatusBadge';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useRiskStore, WORKFLOW_TRANSITIONS } from '../../store/useRiskStore';
import { RiskSeverity, RiskStatus } from '../../types';
import styles from './RiskDetailModal.module.css';

const SEVERITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'neutral',
};

/** Ordered workflow stages for the visual pipeline */
const WORKFLOW_STAGES: { status: RiskStatus; label: string }[] = [
  { status: RiskStatus.OPEN, label: 'Open' },
  { status: RiskStatus.ASSIGNED, label: 'Assigned' },
  { status: RiskStatus.IN_PROGRESS, label: 'In Progress' },
  { status: RiskStatus.RESOLVED, label: 'Resolved' },
  { status: RiskStatus.APPROVED, label: 'Approved' },
  { status: RiskStatus.CLOSED, label: 'Closed' },
];

function getStageIndex(status: RiskStatus): number {
  const idx = WORKFLOW_STAGES.findIndex((s) => s.status === status);
  // Handle legacy statuses that don't map cleanly
  if (idx >= 0) return idx;
  if (status === RiskStatus.IN_REVIEW) return 2; // treat as IN_PROGRESS equivalent
  if (status === RiskStatus.MITIGATED) return 4; // treat as APPROVED equivalent
  return 0;
}

export function RiskDetailModal() {
  const { selectedRisk, selectRisk, advanceWorkflow, isMutating } = useRiskStore();

  const isOpen = !!selectedRisk;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) selectRisk(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, selectRisk]);

  if (!selectedRisk) return null;

  const risk = selectedRisk;
  const transition = WORKFLOW_TRANSITIONS[risk.status];
  const currentStageIdx = getStageIndex(risk.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.overlay}
        onClick={() => selectRisk(null)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Risk detail: ${risk.title}`}
      >
        {/* ── Header ──────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.riskIdBadge}>{risk.riskId}</span>
            <div className={styles.headerMeta}>
              <StatusBadge variant={SEVERITY_VARIANT[risk.severity] ?? 'neutral'}>
                {risk.severity.charAt(0) + risk.severity.slice(1).toLowerCase()}
              </StatusBadge>
              <StatusBadge variant={resolveVariant(risk.status)} dot>
                {risk.status.replace(/_/g, ' ')}
              </StatusBadge>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => selectRisk(null)} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────── */}
        <div className={styles.body}>
          <h2 className={styles.title}>{risk.title}</h2>

          {/* Workflow Pipeline */}
          <div className={styles.pipeline}>
            <div className={styles.pipelineHeader}>
              <Shield size={15} />
              <span>Workflow Progress</span>
            </div>
            <div className={styles.stages}>
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isPast = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage.status} className={styles.stageItem}>
                    <div
                      className={`${styles.stageDot} ${
                        isPast ? styles.stageDotDone : isCurrent ? styles.stageDotCurrent : styles.stageDotPending
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`${styles.stageLabel} ${
                        isCurrent ? styles.stageLabelCurrent : isPast ? styles.stageLabelDone : ''
                      }`}
                    >
                      {stage.label}
                    </span>
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <div className={`${styles.stageConnector} ${isPast ? styles.stageConnectorDone : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Grid */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><MapPin size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{risk.location.name}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><User size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Owner</span>
                <span className={styles.detailValue}>{risk.owner.fullName}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Calendar size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Due Date</span>
                <span className={styles.detailValue}>
                  {risk.dueDate ? format(new Date(risk.dueDate), 'MMM d, yyyy') : 'Not set'}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Clock size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Last Updated</span>
                <span className={styles.detailValue}>{format(new Date(risk.lastUpdated), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.prose}>{risk.description}</p>
          </div>

          {/* Mitigation Plan */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FileText size={14} />
              Mitigation / Action Plan
            </h3>
            <p className={styles.prose}>{risk.mitigationPlan}</p>
          </div>
        </div>

        {/* ── Footer: Workflow Actions ────────────── */}
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span className={styles.footerHint}>
              {transition
                ? `Next step: ${transition.label} → ${transition.nextStatus.replace(/_/g, ' ')}`
                : 'This risk is in a terminal state'}
            </span>
          </div>
          <div className={styles.footerActions}>
            <PrimaryButton variant="secondary" onClick={() => selectRisk(null)}>
              Close
            </PrimaryButton>
            {transition && (
              <PrimaryButton
                onClick={() => advanceWorkflow(risk.id)}
                loading={isMutating}
                icon={<ChevronRight size={16} />}
              >
                {transition.label}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
