import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { createRiskSchema, type CreateRiskFormData } from '../../schemas/risk.schema';
import { InputField, TextAreaField, SelectField, LocationTreeSelect } from '../form';
import { EvidenceDropzone } from '../form/EvidenceDropzone';
import { PrimaryButton } from '../ui/PrimaryButton';
import { RiskSeverity } from '../../types';
import { ASSIGNABLE_USERS } from '../../data/location-tree';
import { useRiskStore } from '../../store/useRiskStore';
import styles from './CreateRiskSlideOver.module.css';

const SEVERITY_OPTIONS = [
  { value: RiskSeverity.CRITICAL, label: 'Critical — Immediate danger' },
  { value: RiskSeverity.HIGH, label: 'High — Significant risk' },
  { value: RiskSeverity.MEDIUM, label: 'Medium — Moderate concern' },
  { value: RiskSeverity.LOW, label: 'Low — Minor issue' },
];

const USER_OPTIONS = ASSIGNABLE_USERS.map((u) => ({
  value: u.id,
  label: u.name,
}));

export function CreateRiskSlideOver() {
  const { isSlideOverOpen, closeSlideOver, createRisk, isMutating } = useRiskStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const methods = useForm<CreateRiskFormData>({
    resolver: zodResolver(createRiskSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: undefined,
      locationId: '',
      subLocationId: '',
      areaId: '',
      assignedUserId: '',
      actionPlan: '',
      dueDate: '',
    },
    mode: 'onTouched', // Validate on blur — prevents re-render spam on every keystroke
  });

  const { handleSubmit, reset } = methods;

  // Reset form when slide-over opens
  useEffect(() => {
    if (isSlideOverOpen) {
      reset();
    }
  }, [isSlideOverOpen, reset]);

  // Lock body scroll when open
  useEffect(() => {
    if (isSlideOverOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSlideOverOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSlideOverOpen) {
        closeSlideOver();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isSlideOverOpen, closeSlideOver]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeSlideOver();
    }
  };

  const onSubmit = async (data: CreateRiskFormData) => {
    await createRisk(data);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${isSlideOverOpen ? styles.overlayVisible : ''}`}
        onClick={handleBackdropClick}
        aria-hidden={!isSlideOverOpen}
      />

      {/* Slide-over Panel */}
      <aside
        className={`${styles.panel} ${isSlideOverOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Report a new risk"
        aria-hidden={!isSlideOverOpen}
      >
        {/* ── Header ──────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <AlertTriangle size={20} className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>Report New Risk</h2>
              <p className={styles.subtitle}>Fill all required fields to submit</p>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={closeSlideOver}
            aria-label="Close slide-over"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body ───────────────────────────── */}
        <FormProvider {...methods}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className={styles.formBody}>
              {/* Section: Basic Info */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <InputField<CreateRiskFormData>
                  name="title"
                  label="Risk Title"
                  placeholder="e.g., Electrical panel exposure in Zone C"
                  hint="5–120 characters"
                />
                <TextAreaField<CreateRiskFormData>
                  name="description"
                  label="Description"
                  placeholder="Describe the risk, its cause, and potential impact..."
                  maxLength={500}
                  rows={3}
                />
                <div className={styles.twoCol}>
                  <SelectField<CreateRiskFormData>
                    name="severity"
                    label="Severity"
                    options={SEVERITY_OPTIONS}
                    placeholder="Select severity..."
                  />
                  <InputField<CreateRiskFormData>
                    name="dueDate"
                    label="Due Date"
                    type="date"
                    hint="Optional — must be future"
                  />
                </div>
              </div>

              {/* Section: Location */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Location</h3>
                <LocationTreeSelect
                  locationField="locationId"
                  subLocationField="subLocationId"
                  areaField="areaId"
                />
              </div>

              {/* Section: Assignment & Action */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Assignment & Action Plan</h3>
                <SelectField<CreateRiskFormData>
                  name="assignedUserId"
                  label="Assign Owner"
                  options={USER_OPTIONS}
                  placeholder="Select team member..."
                />
                <TextAreaField<CreateRiskFormData>
                  name="actionPlan"
                  label="Action Plan"
                  placeholder="Describe the mitigation steps, resources needed, and timeline..."
                  maxLength={2000}
                  rows={4}
                />
                </div>

              {/* Section: Evidence */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Evidence (Optional)</h3>
                <EvidenceDropzone />
              </div>
            </div>

            {/* ── Footer Actions ──────────────────── */}
            <div className={styles.footer}>
              <PrimaryButton
                type="button"
                variant="secondary"
                onClick={closeSlideOver}
                disabled={isMutating}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                type="submit"
                loading={isMutating}
              >
                {isMutating ? 'Submitting...' : 'Submit Risk Report'}
              </PrimaryButton>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
