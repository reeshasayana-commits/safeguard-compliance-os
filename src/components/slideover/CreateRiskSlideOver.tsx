import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PrimaryButton } from '../ui/PrimaryButton';
import styles from './CreateRiskSlideOver.module.css';

interface CreateRiskSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRiskSlideOver({ isOpen, onClose }: CreateRiskSlideOverProps) {
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

            <div className={styles.content}>
              <div className={styles.formSection}>
                <label className={styles.label}>Risk Title</label>
                <input type="text" className={styles.input} placeholder="e.g. Fire exit path blocked" />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formSection}>
                  <label className={styles.label}>Severity</label>
                  <select className={styles.select}>
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
                <div className={styles.formSection}>
                  <label className={styles.label}>Category</label>
                  <select className={styles.select}>
                    <option>Safety</option>
                    <option>Security</option>
                    <option>Environmental</option>
                  </select>
                </div>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.textarea} 
                  rows={4} 
                  placeholder="Describe the findings in detail..."
                />
              </div>

              <div className={styles.tipBox}>
                <Info size={16} />
                <p>Ensure you specify the exact location and capture evidence photos if possible.</p>
              </div>
            </div>

            <div className={styles.footer}>
              <PrimaryButton variant="secondary" onClick={onClose} className={styles.footerBtn}>
                Cancel
              </PrimaryButton>
              <PrimaryButton className={styles.footerBtn}>
                Create Entry
              </PrimaryButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
