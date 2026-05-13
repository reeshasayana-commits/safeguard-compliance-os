import { useEffect } from 'react';
import { X, MapPin, User, Calendar, ClipboardCheck, Info } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge, resolveVariant } from '../ui/StatusBadge';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useAuditStore } from '../../store/useAuditStore';
import styles from './AuditDetailModal.module.css';

export function AuditDetailModal() {
  const { selectedAudit, selectAudit, isDetailOpen } = useAuditStore();

  const isOpen = isDetailOpen && !!selectedAudit;

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
      if (e.key === 'Escape' && isOpen) selectAudit(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, selectAudit]);

  if (!isOpen || !selectedAudit) return null;

  const audit = selectedAudit;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.overlay}
        onClick={() => selectAudit(null)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Audit detail: ${audit.auditId}`}
      >
        {/* ── Header ──────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.auditIdBadge}>{audit.auditId}</span>
            <StatusBadge variant={resolveVariant(audit.status)} dot>
              {audit.status.replace(/_/g, ' ')}
            </StatusBadge>
          </div>
          <button className={styles.closeBtn} onClick={() => selectAudit(null)} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────── */}
        <div className={styles.body}>
          <h2 className={styles.title}>{audit.unitName || 'Safety Compliance Audit'}</h2>

          {/* Detail Grid */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><MapPin size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{audit.location.name}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><User size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Auditor</span>
                <span className={styles.detailValue}>{audit.auditor.fullName}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><Calendar size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Scheduled Date</span>
                <span className={styles.detailValue}>
                  {format(new Date(audit.scheduledDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}><ClipboardCheck size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Score</span>
                <span className={styles.detailValue}>
                  {audit.score !== null ? `${audit.score}%` : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {audit.notes && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Info size={14} />
                Audit Notes
              </h3>
              <p className={styles.prose}>{audit.notes}</p>
            </div>
          )}
        </div>

        {/* ── Footer: Actions ────────────────────── */}
        <div className={styles.footer}>
          <PrimaryButton variant="secondary" onClick={() => selectAudit(null)}>
            Close
          </PrimaryButton>
          <PrimaryButton 
            onClick={() => {
              const { openSlideOver } = useAuditStore.getState();
              openSlideOver();
            }}
          >
            Edit Audit
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
