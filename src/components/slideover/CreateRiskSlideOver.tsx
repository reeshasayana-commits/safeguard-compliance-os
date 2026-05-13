import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createRiskSchema, type CreateRiskFormData } from '../../schemas/risk.schema';
import { InputField, TextAreaField, LocationTreeSelect, SelectField } from '../form';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useRiskStore } from '../../store/useRiskStore';
import { RiskSeverity } from '../../types';
import styles from './CreateRiskSlideOver.module.css';

interface CreateRiskSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_OPTIONS = [
  { value: RiskSeverity.LOW, label: 'Low' },
  { value: RiskSeverity.MEDIUM, label: 'Medium' },
  { value: RiskSeverity.HIGH, label: 'High' },
  { value: RiskSeverity.CRITICAL, label: 'Critical' },
];

const OWNER_OPTIONS = [
  { value: 'u1', label: 'Ananya Sharma (Safety Mgr)' },
  { value: 'u2', label: 'Raj Patel (Operations)' },
  { value: 'u4', label: 'Priya Nair (Compliance)' },
];

export function CreateRiskSlideOver({ isOpen, onClose }: CreateRiskSlideOverProps) {
  const { createRisk, isMutating } = useRiskStore();

  const methods = useForm<CreateRiskFormData>({
    resolver: zodResolver(createRiskSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: RiskSeverity.MEDIUM,
      locationId: '',
      subLocationId: '',
      areaId: '',
      assignedUserId: '',
      actionPlan: '',
      dueDate: '',
    },
    mode: 'onTouched',
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateRiskFormData) => {
    try {
      await createRisk(data);
      toast.success('Risk registered successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to register risk');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles.backdrop}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={styles.panel}
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <div className={styles.iconCircle}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3>Register New Risk</h3>
                  <p>Document a new compliance threat</p>
                </div>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
                <div className={styles.content}>
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Basic Information</h4>
                    <InputField<CreateRiskFormData>
                      name="title"
                      label="Risk Title"
                      placeholder="e.g. Fire exit path blocked by pallets"
                    />
                    
                    <div className={styles.formGrid}>
                      <SelectField<CreateRiskFormData>
                        name="severity"
                        label="Severity"
                        options={SEVERITY_OPTIONS}
                      />
                      <SelectField<CreateRiskFormData>
                        name="assignedUserId"
                        label="Assign Owner"
                        options={OWNER_OPTIONS}
                        placeholder="Select owner..."
                      />
                    </div>

                    <TextAreaField<CreateRiskFormData>
                      name="description"
                      label="Description"
                      placeholder="Describe the findings in detail..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Location Hierarchy</h4>
                    <LocationTreeSelect
                      locationField="locationId"
                      subLocationField="subLocationId"
                      areaField="areaId"
                    />
                  </div>

                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Remediation Strategy</h4>
                    <TextAreaField<CreateRiskFormData>
                      name="actionPlan"
                      label="Mitigation Plan"
                      placeholder="How should this be fixed? (Minimum 20 characters)"
                      rows={4}
                    />
                    <InputField<CreateRiskFormData>
                      name="dueDate"
                      label="Target Completion Date"
                      type="date"
                    />
                  </div>

                  <div className={styles.tipBox}>
                    <Info size={16} />
                    <p>Ensure you specify the exact location and capture evidence photos if possible.</p>
                  </div>
                </div>

                <div className={styles.footer}>
                  <PrimaryButton
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className={styles.footerBtn}
                    disabled={isMutating}
                  >
                    Cancel
                  </PrimaryButton>
                  <PrimaryButton
                    type="submit"
                    className={styles.footerBtn}
                    loading={isMutating}
                  >
                    Create Entry
                  </PrimaryButton>
                </div>
              </form>
            </FormProvider>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
