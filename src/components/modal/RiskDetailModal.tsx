import { useEffect, useState, useCallback } from 'react';
import {
  X, AlertTriangle, MapPin, User, Calendar, Clock,
  FileText, ChevronRight, Loader2, Shield, Pencil, Save, RotateCcw, Check, ImageIcon,
  UploadCloud, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { StatusBadge, resolveVariant } from '../ui/StatusBadge';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useRiskStore, WORKFLOW_TRANSITIONS } from '../../store/useRiskStore';
import { RiskSeverity, RiskStatus } from '../../types/index';
import styles from './RiskDetailModal.module.css';

const StatusCheckIcon = () => <Check size={14} strokeWidth={3} />;

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
  if (idx >= 0) return idx;
  if (status === RiskStatus.IN_REVIEW) return 2;
  if (status === RiskStatus.MITIGATED) return 4;
  return 0;
}

export function RiskDetailModal() {
  const { selectedRisk, selectRisk, advanceWorkflow, updateRisk, isMutating } = useRiskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRisk, setEditedRisk] = useState<any>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Simulated Role & Gates
  const [simulatedRole, setSimulatedRole] = useState<'Assignee' | 'Auditor'>('Assignee');
  const [showResolveGate, setShowResolveGate] = useState(false);
  const [gateActionTaken, setGateActionTaken] = useState('');
  const [gateClosureEvidence, setGateClosureEvidence] = useState<string | null>(null);

  const isOpen = !!selectedRisk;

  useEffect(() => {
    if (selectedRisk) {
      setEditedRisk({
        title: selectedRisk.title,
        description: selectedRisk.description,
        mitigationPlan: selectedRisk.mitigationPlan,
        referenceStandard: selectedRisk.referenceStandard || '',
        actionTaken: selectedRisk.actionTaken || '',
        assignedUserId: selectedRisk.ownerId || '',
      });
      setIsEditing(false);
      setShowResolveGate(false);
    }
  }, [selectedRisk]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) selectRisk(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, selectRisk]);

  // Dropzone for Closure Evidence
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setGateClosureEvidence(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  if (!selectedRisk) return null;

  const risk = selectedRisk;
  const transition = WORKFLOW_TRANSITIONS[risk.status];
  const currentStageIdx = getStageIndex(risk.status);

  const handleSave = async () => {
    if (!editedRisk) return;
    await updateRisk(risk.id, editedRisk);
    setIsEditing(false);
  };

  const handleWorkflowAdvance = async () => {
    if (!transition) return;

    // Gate: OPEN -> ASSIGNED requires an assigned user
    if (risk.status === RiskStatus.OPEN && (!risk.ownerId || risk.ownerId === 'Unassigned')) {
      alert('Please edit the risk and assign a user before proceeding.');
      setIsEditing(true);
      return;
    }

    // Gate: IN_PROGRESS -> RESOLVED requires action plan text
    if (risk.status === RiskStatus.IN_PROGRESS && !showResolveGate) {
      setShowResolveGate(true);
      return; // Stop here and show the inline form
    }
    if (showResolveGate && !gateActionTaken.trim()) {
      alert('Action Taken description is required to mark as resolved.');
      return;
    }

    const timestamp = format(new Date(), 'MMM do, h:mm a');
    const logMsg = `[${simulatedRole}] moved this from '${risk.status.replace(/_/g, ' ')}' to '${transition.nextStatus.replace(/_/g, ' ')}' on ${timestamp}.`;
    const newLogs = [...(risk.activityLogs || []), logMsg];

    const payload: any = { activityLogs: newLogs };
    if (showResolveGate) {
      payload.actionTaken = gateActionTaken;
      if (gateClosureEvidence) payload.closureEvidenceUrl = gateClosureEvidence;
    }

    await advanceWorkflow(risk.id, payload);
    setShowResolveGate(false);
    setGateActionTaken('');
    setGateClosureEvidence(null);
  };

  const canAdvance = () => {
    if (!transition) return false;
    // Allow assigning (OPEN -> ASSIGNED) regardless of simulated role
    if (risk.status === RiskStatus.OPEN) return true;
    
    if (simulatedRole === 'Assignee') {
      return [RiskStatus.ASSIGNED, RiskStatus.IN_PROGRESS, RiskStatus.IN_REVIEW].includes(risk.status);
    } else {
      return [RiskStatus.RESOLVED, RiskStatus.APPROVED, RiskStatus.MITIGATED].includes(risk.status);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={() => selectRisk(null)} aria-hidden="true" />

      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Risk detail: ${risk.title}`}>
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
          <div className={styles.headerActions}>
            <div className={styles.roleSwitcher}>
              <User size={14} />
              <select 
                className={styles.roleSelect} 
                value={simulatedRole} 
                onChange={(e) => setSimulatedRole(e.target.value as any)}
              >
                <option value="Assignee">Assignee Role</option>
                <option value="Auditor">Auditor Role</option>
              </select>
            </div>
            {!isEditing && (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)} aria-label="Edit risk">
                <Pencil size={18} />
              </button>
            )}
            <button className={styles.closeBtn} onClick={() => selectRisk(null)} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────── */}
        <div className={styles.body}>
          {isEditing ? (
            <input
              className={styles.titleInput}
              value={editedRisk.title}
              onChange={(e) => setEditedRisk({ ...editedRisk, title: e.target.value })}
              autoFocus
            />
          ) : (
            <h2 className={styles.title}>{risk.title}</h2>
          )}

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
                    <div className={`${styles.stageDot} ${isPast ? styles.stageDotDone : isCurrent ? styles.stageDotCurrent : styles.stageDotPending}`}>
                      {isPast ? <StatusCheckIcon /> : idx + 1}
                    </div>
                    <span className={`${styles.stageLabel} ${isCurrent ? styles.stageLabelCurrent : isPast ? styles.stageLabelDone : ''}`}>
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
                {isEditing ? (
                  <input
                    className={styles.textArea}
                    style={{ height: '30px', padding: '4px' }}
                    value={editedRisk.assignedUserId}
                    onChange={(e) => setEditedRisk({ ...editedRisk, assignedUserId: e.target.value })}
                    placeholder="Enter Owner ID"
                  />
                ) : (
                  <span className={styles.detailValue}>{risk.owner.fullName}</span>
                )}
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
                <span className={styles.detailValue}>{format(new Date(risk.updatedAt || risk.lastUpdated), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            {isEditing ? (
              <textarea
                className={styles.textArea}
                value={editedRisk.description}
                onChange={(e) => setEditedRisk({ ...editedRisk, description: e.target.value })}
              />
            ) : (
              <p className={styles.prose}>{risk.description}</p>
            )}
          </div>

          {/* Mitigation Plan */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><FileText size={14} /> Mitigation / Action Plan</h3>
            {isEditing ? (
              <textarea
                className={styles.textArea}
                value={editedRisk.mitigationPlan}
                onChange={(e) => setEditedRisk({ ...editedRisk, mitigationPlan: e.target.value })}
              />
            ) : (
              <p className={styles.prose}>{risk.mitigationPlan}</p>
            )}
          </div>

          {/* Action Taken */}
          {(risk.status !== RiskStatus.OPEN && risk.status !== RiskStatus.ASSIGNED) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}><Check size={14} /> Action Taken</h3>
              {isEditing ? (
                <textarea
                  className={styles.textArea}
                  value={editedRisk.actionTaken || ''}
                  onChange={(e) => setEditedRisk({ ...editedRisk, actionTaken: e.target.value })}
                />
              ) : (
                <p className={styles.prose}>{risk.actionTaken || 'No action recorded yet.'}</p>
              )}
            </div>
          )}

          {/* Evidence Images */}
          {(risk.evidenceUrl || risk.closureEvidenceUrl) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}><ImageIcon size={14} /> Evidence Photos</h3>
              <div className={styles.imageGallery}>
                {risk.evidenceUrl && (
                  <button type="button" className={styles.imageThumbnail} onClick={() => setLightboxImage(risk.evidenceUrl!)}>
                    <img src={risk.evidenceUrl} alt="Risk evidence" />
                    <span className={styles.imageLabel}>Initial Evidence</span>
                  </button>
                )}
                {risk.closureEvidenceUrl && (
                  <button type="button" className={styles.imageThumbnail} onClick={() => setLightboxImage(risk.closureEvidenceUrl!)}>
                    <img src={risk.closureEvidenceUrl} alt="Closure evidence" />
                    <span className={styles.imageLabel}>Closure Evidence</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Activity / History Log */}
          {risk.activityLogs && risk.activityLogs.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}><Activity size={14} /> History Log</h3>
              <div className={styles.historyTimeline}>
                {risk.activityLogs.map((log, idx) => (
                  <div key={idx} className={styles.historyItem}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Gate Form (In Progress -> Resolved) */}
          {showResolveGate && (
            <div className={styles.gateForm}>
              <h3 className={styles.sectionTitle}>Provide Resolution Details</h3>
              <textarea
                className={styles.textArea}
                placeholder="Describe what action was taken to resolve this..."
                value={gateActionTaken}
                onChange={(e) => setGateActionTaken(e.target.value)}
              />
              <div {...getRootProps()} className={`${styles.gateDropzone} ${isDragActive ? styles.gateDropzoneActive : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud size={24} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                {gateClosureEvidence ? (
                  <p style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-sm)' }}>Image attached successfully!</p>
                ) : (
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>Drop closure evidence photo here, or click to select</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: Actions ────────────────────── */}
        <div className={styles.footer}>
          {isEditing ? (
            <>
              <div className={styles.footerInfo}><span className={styles.footerHint}>Unsaved changes will be lost</span></div>
              <div className={styles.footerActions}>
                <PrimaryButton variant="secondary" onClick={() => setIsEditing(false)} icon={<RotateCcw size={16} />}>Cancel</PrimaryButton>
                <PrimaryButton onClick={handleSave} loading={isMutating} icon={<Save size={16} />}>Save Changes</PrimaryButton>
              </div>
            </>
          ) : (
            <>
              <div className={styles.footerInfo}>
                <span className={styles.footerHint}>
                  {transition ? `Next step: ${transition.label} → ${transition.nextStatus.replace(/_/g, ' ')}` : 'This risk is in a terminal state'}
                </span>
              </div>
              <div className={styles.footerActions}>
                <PrimaryButton variant="secondary" onClick={() => selectRisk(null)}>Close</PrimaryButton>
                {transition && canAdvance() && (
                  <PrimaryButton onClick={handleWorkflowAdvance} loading={isMutating} icon={<ChevronRight size={16} />}>
                    {showResolveGate ? 'Submit & Resolve' : transition.label}
                  </PrimaryButton>
                )}
                {transition && !canAdvance() && (
                  <PrimaryButton variant="secondary" onClick={() => {}} disabled title="You do not have permission to perform this action.">
                    {transition.label} (Restricted)
                  </PrimaryButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div className={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxImage(null)}><X size={24} /></button>
          <img src={lightboxImage} alt="Evidence full view" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
