import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ClipboardCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createAuditSchema, type CreateAuditFormData } from '../../schemas/audit.schema';
import { InputField, TextAreaField, LocationTreeSelect, SelectField } from '../form';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useAuditStore } from '../../store/useAuditStore';
import { AuditStatus } from '../../types';
import styles from './CreateAuditSlideOver.module.css';

const STATUS_OPTIONS = [
  { value: AuditStatus.SCHEDULED, label: 'Scheduled' },
  { value: AuditStatus.IN_PROGRESS, label: 'In Progress' },
];

export function CreateAuditSlideOver() {
  const { isSlideOverOpen, closeSlideOver, createAudit, updateAudit, isMutating, selectedAudit } = useAuditStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const methods = useForm<CreateAuditFormData>({
    resolver: zodResolver(createAuditSchema),
    defaultValues: {
      unitName: '',
      auditorName: '',
      scheduledDate: '',
      locationId: '',
      subLocationId: '',
      areaId: '',
      status: AuditStatus.SCHEDULED,
      notes: '',
    },
    mode: 'onTouched',
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (isSlideOverOpen) {
      if (selectedAudit) {
        // Map audit to form data
        reset({
          unitName: (selectedAudit as any).unitName || 'Safety Compliance Audit',
          auditorName: selectedAudit.auditor.fullName,
          scheduledDate: selectedAudit.scheduledDate.split('T')[0],
          locationId: '', // These will be handled by the LocationTreeSelect if we had IDs
          subLocationId: '',
          areaId: selectedAudit.locationId,
          status: selectedAudit.status as any,
          notes: selectedAudit.notes || '',
        });
      } else {
        reset({
          unitName: '',
          auditorName: '',
          scheduledDate: '',
          locationId: '',
          subLocationId: '',
          areaId: '',
          status: AuditStatus.SCHEDULED,
          notes: '',
        });
      }
    }
  }, [isSlideOverOpen, reset, selectedAudit]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeSlideOver();
    }
  };

  const onSubmit = async (data: CreateAuditFormData) => {
    try {
      if (selectedAudit) {
        await updateAudit(selectedAudit.id, data);
        toast.success('Audit updated successfully');
      } else {
        await createAudit(data);
        toast.success('Audit scheduled successfully');
      }
      closeSlideOver();
    } catch (error) {
      toast.error(selectedAudit ? 'Failed to update audit' : 'Failed to schedule audit');
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${isSlideOverOpen ? styles.overlayVisible : ''}`}
        onClick={handleBackdropClick}
        aria-hidden={!isSlideOverOpen}
      />

      <aside
        className={`${styles.panel} ${isSlideOverOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={selectedAudit ? 'Edit audit' : 'Schedule a new audit'}
        aria-hidden={!isSlideOverOpen}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ClipboardCheck size={20} className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>{selectedAudit ? 'Edit Audit Details' : 'Schedule New Audit'}</h2>
              <p className={styles.subtitle}>{selectedAudit ? 'Modify the audit parameters' : 'Fill all required fields to schedule'}</p>
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

        <FormProvider {...methods}>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className={styles.formBody}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <InputField<CreateAuditFormData>
                  name="unitName"
                  label="Unit Name"
                  placeholder="e.g., North Wing Operations"
                />
                <InputField<CreateAuditFormData>
                  name="auditorName"
                  label="Auditor Name"
                  placeholder="e.g., Jane Doe"
                />
                <div className={styles.twoCol}>
                  <SelectField<CreateAuditFormData>
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status..."
                  />
                  <InputField<CreateAuditFormData>
                    name="scheduledDate"
                    label="Scheduled Date"
                    type="date"
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Location</h3>
                <LocationTreeSelect
                  locationField="locationId"
                  subLocationField="subLocationId"
                  areaField="areaId"
                />
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Notes (Optional)</h3>
                <TextAreaField<CreateAuditFormData>
                  name="notes"
                  label="Additional Notes"
                  placeholder="Any specific areas of focus or preliminary observations..."
                  maxLength={2000}
                  rows={4}
                />
              </div>
            </div>

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
                {selectedAudit ? (isMutating ? 'Updating...' : 'Update Audit') : (isMutating ? 'Scheduling...' : 'Schedule Audit')}
              </PrimaryButton>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
